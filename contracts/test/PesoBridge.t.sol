// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PesoBridge.sol";

contract PesoBridgeTest is Test {
    PesoBridge public bridge;
    address public owner = address(1);
    address public agent = address(2);
    address public merchant = address(3);
    address public unregisteredMerchant = address(4);

    // Re-declare events for expectEmit
    event MerchantRegistered(address indexed wallet, string mpMerchantHash);
    event PaymentSettled(bytes32 indexed intentHash, address indexed merchant, uint256 usdcAmount, uint256 arsAmount, string paymentIntentId);

    function setUp() public {
        vm.prank(owner);
        bridge = new PesoBridge();
        
        vm.prank(owner);
        bridge.setAgent(agent);
    }

    function testRegisterMerchant() public {
        vm.prank(merchant);
        vm.expectEmit(true, false, false, true);
        emit MerchantRegistered(merchant, "hash_123");
        bridge.registerMerchant("hash_123");
        
        (string memory hash, bool isRegistered) = bridge.merchants(merchant);
        assertTrue(isRegistered);
        assertEq(hash, "hash_123");
    }

    function testSettlePaymentSucceeds() public {
        // Register first
        vm.prank(merchant);
        bridge.registerMerchant("hash_123");

        // Settle payment
        uint256 usdcAmount = 100 * 10**6; // 100 mUSDC
        uint256 arsAmount = 100000;
        string memory intentId = "intent_abc";

        vm.prank(agent);
        vm.expectEmit(true, true, false, true);
        bytes32 intentHash = keccak256(abi.encodePacked(intentId));
        emit PaymentSettled(intentHash, merchant, usdcAmount, arsAmount, intentId);
        
        bridge.settlePayment(merchant, usdcAmount, arsAmount, intentId);

        // Check balances and processed payments
        assertEq(bridge.balanceOf(merchant), usdcAmount);
        assertTrue(bridge.processedPayments(intentHash));
    }

    function testSettleTwiceReverts() public {
        vm.prank(merchant);
        bridge.registerMerchant("hash_123");

        uint256 usdcAmount = 100 * 10**6;
        uint256 arsAmount = 100000;
        string memory intentId = "intent_abc";

        vm.prank(agent);
        bridge.settlePayment(merchant, usdcAmount, arsAmount, intentId);

        vm.prank(agent);
        vm.expectRevert("PesoBridge: payment already processed");
        bridge.settlePayment(merchant, usdcAmount, arsAmount, intentId);
    }

    function testSettleToUnregisteredMerchantReverts() public {
        uint256 usdcAmount = 100 * 10**6;
        uint256 arsAmount = 100000;
        string memory intentId = "intent_abc";

        vm.prank(agent);
        vm.expectRevert("PesoBridge: unregistered merchant");
        bridge.settlePayment(unregisteredMerchant, usdcAmount, arsAmount, intentId);
    }

    function testOnlyAgentCanSettle() public {
        vm.prank(merchant);
        bridge.registerMerchant("hash_123");

        uint256 usdcAmount = 100 * 10**6;
        uint256 arsAmount = 100000;
        string memory intentId = "intent_abc";

        vm.prank(merchant); // Not the agent
        vm.expectRevert("PesoBridge: caller is not the agent");
        bridge.settlePayment(merchant, usdcAmount, arsAmount, intentId);
    }
}
