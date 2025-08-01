"use client";

import Link from "next/link";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { usePolicyAcceptance } from "../hooks/use-policy-acceptance";

interface AcceptanceChecklistProps {
  onAccepted: () => void;
}

export function AcceptanceChecklist({ onAccepted }: AcceptanceChecklistProps) {
  const { acceptanceState, setAcceptance, isLoaded } = usePolicyAcceptance();

  if (!isLoaded) {
    return null;
  }

  const canContinue =
    acceptanceState.policyAccepted && acceptanceState.agreementAccepted;

  return (
    <div className="space-y-4 rounded-lg border bg-zinc-50 p-6">
      <h3 className="font-semibold text-gray-800">Before you continue...</h3>
      <p className="text-sm text-gray-600">
        Please review and accept our policies to enable file transfers.
      </p>
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="policy-accepted"
            checked={acceptanceState.policyAccepted}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              setAcceptance({ policyAccepted: !!checked })
            }
          />
          <Label
            htmlFor="policy-accepted"
            className="text-sm font-normal text-gray-700"
          >
            I have read and agree to the{" "}
            <Link
              href="/policy"
              target="_blank"
              className="text-primary-color hover:underline"
            >
              Policy
            </Link>
            .
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreement-accepted"
            checked={acceptanceState.agreementAccepted}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              setAcceptance({ agreementAccepted: !!checked })
            }
          />
          <Label
            htmlFor="agreement-accepted"
            className="text-sm font-normal text-gray-700"
          >
            I have read and agree to the{" "}
            <Link
              href="/user-agreement"
              target="_blank"
              className="text-primary-color hover:underline"
            >
              User Agreement
            </Link>
            .
          </Label>
        </div>
      </div>
      <Button
        onClick={onAccepted}
        disabled={!canContinue}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
}