import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("message-board", () => {
  it("sets and reads own message", () => {
    const msg = "hello stacks";
    const set = simnet.callPublicFn(
      "message-board",
      "set-message",
      [Cl.stringUtf8(msg)],
      wallet1
    );
    expect(set.result).toBeOk(Cl.bool(true));

    const mine = simnet.callReadOnlyFn(
      "message-board",
      "get-my-message",
      [],
      wallet1
    );
    expect(mine.result).toBeUtf8(msg);
  });

  it("reads others message & clears", () => {
    const msg2 = "merhaba";
    simnet.callPublicFn(
      "message-board",
      "set-message",
      [Cl.stringUtf8(msg2)],
      wallet2
    );

    const read = simnet.callReadOnlyFn(
      "message-board",
      "get-message",
      [Cl.standardPrincipal(wallet2)],
      wallet1
    );
    expect(read.result).toBeUtf8(msg2);

    const cleared = simnet.callPublicFn(
      "message-board",
      "clear-message",
      [],
      wallet2
    );
    expect(cleared.result).toBeOk(Cl.bool(true));

    const readAfter = simnet.callReadOnlyFn(
      "message-board",
      "get-message",
      [Cl.standardPrincipal(wallet2)],
      wallet1
    );
    expect(readAfter.result).toBeUtf8("none"); // default-to u"none"
  });

  it("rejects empty or too long", () => {
    // Test empty string - should be rejected by our contract
    const empty = simnet.callPublicFn(
      "message-board",
      "set-message",
      [Cl.stringUtf8("")],
      wallet1
    );
    expect(empty.result).toBeErr(Cl.uint(101));

    // Test exactly 280 chars - should work (max allowed by type)
    const maxLength = "x".repeat(280);
    const maxResult = simnet.callPublicFn(
      "message-board",
      "set-message",
      [Cl.stringUtf8(maxLength)],
      wallet1
    );
    expect(maxResult.result).toBeOk(Cl.bool(true));
  });
});
