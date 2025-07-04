# Game Plan: Nully User Policy & Agreement Acceptance (v2)

This document outlines the revised implementation plan for requiring user acceptance of a policy and user agreement before using the Nully file transfer application. This plan replaces the previous dialog-based approach with an integrated UI.

## Phase 1: Cleanup and Static Pages

This phase removes the previous implementation artifacts and sets up the necessary static content pages.

### Task 1.1: Clean Up Obsolete Components

-   **Status**: Done
-   **Task Description**: Remove the `PolicyPage` component and its associated route, as they are no longer needed in the new design.
-   **Target Files & Paths**:
    -   Delete `apps/nully/components/policy-page.tsx`.
    -   Delete `apps/nully/app/[locale]/policy/page.tsx`.
-   **Dependencies/Preconditions**: None.
-   **Test Conditions**: The human tester will verify that the files have been deleted and navigating to `/policy` results in a 404 error.

### Task 1.2: Create Static Policy Page

-   **Status**: Done
-   **Task Description**: Create a static, text-only page for the Privacy Policy at `/policy`.
-   **Target Files & Paths**:
    -   Modify `apps/nully/app/[locale]/privacy/page.tsx` -> rename to `apps/nully/app/[locale]/policy/page.tsx` and update content.
-   **Dependencies/Preconditions**: None.
-   **Test Conditions**: The human tester will navigate to `/policy` and verify the content is displayed correctly.

### Task 1.3: Create Static User Agreement Page

-   **Status**: Done
-   **Task Description**: Create a new static, text-only page for the User Agreement at `/user-agreement`.
-   **Target Files & Paths**:
    -   Create `apps/nully/app/[locale]/user-agreement/page.tsx`.
-   **Dependencies/Preconditions**: None.
-   **Test Conditions**: The human tester will navigate to `/user-agreement` and verify the content is displayed correctly.

## Phase 2: Core Logic and UI

This phase focuses on the business logic and the new UI component for handling acceptance.

### Task 2.1: Update `usePolicyAcceptance` Hook

-   **Status**: Done
-   **Task Description**: Modify the hook to manage acceptance for both the policy and the user agreement. It will store an object `{ policyAccepted: boolean, agreementAccepted: boolean }` in `localStorage`.
-   **Target Files & Paths**:
    -   Modify `apps/nully/hooks/use-policy-acceptance.ts`.
-   **Dependencies/Preconditions**: None.
-   **Test Conditions**: The human tester will use browser developer tools to verify that accepting the policies correctly sets an object like `{"policyAccepted":true,"agreementAccepted":true}` in `localStorage`.

### Task 2.2: Create `AcceptanceChecklist` Component

-   **Status**: Done
-   **Task Description**: Create a new component that displays two checkboxes, links to `/policy` and `/user-agreement`, and a "Continue" button. The button is disabled until both checkboxes are ticked. It uses the `usePolicyAcceptance` hook to manage state and calls an `onAccepted` prop when the button is clicked.
-   **Target Files & Paths**:
    -   Create `apps/nully/components/acceptance-checklist.tsx`.
-   **Dependencies/Preconditions**: Task 2.1 must be complete.
-   **Test Conditions**: The human tester will (by temporarily adding it to a page) verify the component renders two checkboxes and a disabled "Continue" button. After checking both boxes, the button should become enabled. Clicking it should trigger the `onAccepted` callback.

## Phase 3: Integration into User Flows

This phase integrates the acceptance check into the core application pages.

### Task 3.1: Integrate into Send Page

-   **Status**: Done
-   **Task Description**: Modify the `SendPage` to use a local state to manage whether the `AcceptanceChecklist` is shown. On initial load, if policies are not accepted, it shows the checklist. The checklist's `onAccepted` callback will update the local state to hide the checklist and show the file staging area.
-   **Target Files & Paths**:
    -   Modify `apps/nully/components/send-page.tsx`.
-   **Dependencies/Preconditions**: Task 2.2 must be complete.
-   **Test Conditions**: The human tester will:
    1.  Clear `localStorage` and navigate to `/transfer`.
    2.  Verify the `StagedFiles` block is hidden and the `AcceptanceChecklist` is shown.
    3.  Accept the policies and click "Continue".
    4.  Verify the `AcceptanceChecklist` is hidden and the `StagedFiles` block appears, allowing file selection.
    5.  Reload the page and verify the `StagedFiles` block is shown immediately.

### Task 3.2: Integrate into Receive Page

-   **Status**: Done
-   **Task Description**: Modify the `ReceivePage` to use a local state to manage whether the `AcceptanceChecklist` is shown. On initial load, if policies are not accepted, it shows the checklist. The checklist's `onAccepted` callback will update the local state to hide the checklist and show the `AvailableFiles` area.
-   **Target Files & Paths**:
    -   Modify `apps/nully/components/receive-page.tsx`.
-   **Dependencies/Preconditions**: Task 2.2 must be complete.
-   **Test Conditions**: The human tester will:
    1.  Clear `localStorage` and navigate to a `/join/[peerId]` URL.
    2.  Verify the `AvailableFiles` block is hidden and the `AcceptanceChecklist` is shown.
    3.  Accept the policies and click "Continue".
    4.  Verify the `AcceptanceChecklist` is hidden and the `AvailableFiles` block appears.
    5.  Reload the page and verify the `AvailableFiles` block is shown immediately.