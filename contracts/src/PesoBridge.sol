// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PesoBridge mUSDC - Demo USDC settlement token for MercadoPago -> Monad
/// @notice Minimal ERC-20 (6 decimals) plus an agent-gated settlePayment function.
/// @dev Built for Monad Blitz Buenos Aires. Deploy on Monad testnet (chainId 10143).
///      An off-chain AI settlement agent calls settlePayment after a MercadoPago
///      QR payment is confirmed, minting USDC to the buyer. Real USDC does not
///      exist on Monad testnet, so this mock token stands in for the demo.
contract PesoBridgeUSDC {
    // --- ERC-20 metadata ---
    string public constant name = "PesoBridge USD Coin";
    string public constant symbol = "mUSDC";
    uint8 public constant decimals = 6; // matches real USDC

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // --- Access control ---
    address public owner;   // deployer
    address public agent;   // authorized AI settlement agent (the only minter)

    // --- Merchant Registry ---
    struct Merchant {
        string mpMerchantHash;
        bool isRegistered;
    }
    mapping(address => Merchant) public merchants;

    // --- Replay protection: each MercadoPago payment id settles only once ---
    // key = keccak256(abi.encodePacked(mpPaymentId))
    mapping(bytes32 => bool) public processedPayments;

    // --- Events ---
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AgentUpdated(address indexed previousAgent, address indexed newAgent);
    // Emitted on each settled MercadoPago payment. Drives the explorer demo.
    event PaymentSettled(
        bytes32 indexed mpPaymentHash,
        address indexed merchant,
        uint256 usdcAmount,
        uint256 arsAmount,
        string mpPaymentId
    );
    event MerchantRegistered(address indexed merchant, string mpMerchantHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAgent() {
        require(msg.sender == agent, "Not authorized agent");
        _;
    }

    constructor() {
        owner = msg.sender;
        agent = msg.sender; // owner acts as agent until updated
    }

    /// @notice Set the AI settlement agent allowed to mint on confirmed payments.
    function setAgent(address newAgent) external onlyOwner {
        require(newAgent != address(0), "Zero address");
        emit AgentUpdated(agent, newAgent);
        agent = newAgent;
    }

    /// @notice Register a merchant wallet linked to a MercadoPago merchant hash
    function registerMerchant(string calldata mpMerchantHash) external {
        require(bytes(mpMerchantHash).length > 0, "Empty hash");
        merchants[msg.sender] = Merchant({
            mpMerchantHash: mpMerchantHash,
            isRegistered: true
        });
        emit MerchantRegistered(msg.sender, mpMerchantHash);
    }

    /// @notice Settle a confirmed MercadoPago QR payment by minting USDC to the merchant.
    /// @param merchant Recipient wallet of the digital dollars.
    /// @param usdcAmount Amount of mUSDC to mint (6 decimals).
    /// @param arsAmount Original amount paid in ARS (for the on-chain receipt/event).
    /// @param mpPaymentId MercadoPago payment id, used for idempotency.
    function settlePayment(
        address merchant,
        uint256 usdcAmount,
        uint256 arsAmount,
        string calldata mpPaymentId
    ) external onlyAgent {
        require(merchant != address(0), "Zero address");
        require(merchants[merchant].isRegistered, "Merchant not registered");
        require(usdcAmount > 0, "Zero amount");
        bytes32 key = keccak256(abi.encodePacked(mpPaymentId));
        require(!processedPayments[key], "Payment already settled");

        processedPayments[key] = true;
        totalSupply += usdcAmount;
        balanceOf[merchant] += usdcAmount;

        emit Transfer(address(0), merchant, usdcAmount);
        emit PaymentSettled(key, merchant, usdcAmount, arsAmount, mpPaymentId);
    }

    // --- Standard ERC-20 so wallets/explorers show balances ---

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= value, "Insufficient allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "Zero address");
        require(balanceOf[from] >= value, "Insufficient balance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }
}
