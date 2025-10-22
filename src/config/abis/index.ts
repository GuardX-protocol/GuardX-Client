import CrashGuardCoreArtifact from '@/contracts/CrashGuardCore.sol/CrashGuardCore.json';
import DEXAggregatorArtifact from '@/contracts/DEXAggregator.sol/DEXAggregator.json';
import EmergencyExecutorArtifact from '@/contracts/EmergencyExecutor.sol/EmergencyExecutor.json';
import PortfolioRebalancerArtifact from '@/contracts/PortfolioRebalancer.sol/PortfolioRebalancer.json';
import PythPriceMonitorArtifact from '@/contracts/PythPriceMonitor.sol/PythPriceMonitor.json';
import CrossChainManagerArtifact from '@/contracts/CrossChainManager.sol/CrossChainManager.json';
import CrossChainEmergencyCoordinatorArtifact from '@/contracts/CrossChainEmergencyCoordinator.sol/CrossChainEmergencyCoordinator.json';
import LitProtocolIntegrationArtifact from '@/contracts/LitProtocolIntegration.sol/LitProtocolIntegration.json';
import { SimpleCrossChainBridgeABI as SimpleCrossChainBridgeABILocal } from './SimpleCrossChainBridge';

export const CrashGuardCoreABI = CrashGuardCoreArtifact.abi;
export const DEXAggregatorABI = DEXAggregatorArtifact.abi;
export const EmergencyExecutorABI = EmergencyExecutorArtifact.abi;
export const PortfolioRebalancerABI = PortfolioRebalancerArtifact.abi;
export const PythPriceMonitorABI = PythPriceMonitorArtifact.abi;
export const CrossChainManagerABI = CrossChainManagerArtifact.abi;
export const CrossChainEmergencyCoordinatorABI = CrossChainEmergencyCoordinatorArtifact.abi;
export const LitProtocolIntegrationABI = LitProtocolIntegrationArtifact.abi;
export const SimpleCrossChainBridgeABI = SimpleCrossChainBridgeABILocal;