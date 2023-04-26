import { LogDescription } from "@ethersproject/abi";
import { Log } from "@ethersproject/providers";
import { Contract, ContractReceipt } from "ethers";

export function parseEvent(
  txReceipt: ContractReceipt,
  contract: Contract,
  eventName: string
): LogDescription | undefined {
  const unparsedEv = txReceipt.logs.find(
    (evInfo: Log) =>
      evInfo.topics[0] == contract.filters![eventName]().topics![0]
  );
  if (!unparsedEv) {
    return undefined;
  }

  const parsedEv = contract.interface.parseLog(unparsedEv!);

  return parsedEv;
}
