// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PesoBridge.sol";

contract DeployPesoBridge is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        PesoBridge bridge = new PesoBridge();
        
        vm.stopBroadcast();
    }
}
