### Top-Level Roadmap

*   **Phase 1: Preparation & Scaffolding** - Set up the new file structure and routing for the dynamic transfer pages without altering existing logic.
*   **Phase 2: Core Logic Implementation** - Implement the redirection and adapt the core hooks to work with the new URL-based state.
*   **Phase 3: Integration & Cleanup** - Integrate the new logic into the page components and clean up the old structure.
*   **Phase 4: Validation** - Perform thorough testing to ensure the new implementation is working correctly and is robust.

---

### Phase 1: Preparation & Scaffolding

| Task Description | Target Files & Paths | Dependencies/Preconditions | Test Conditions | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Create new dynamic route directory** | `apps/nully/app/[locale]/transfer/[peerId]/` | None | Verify that the new directory `apps/nully/app/[locale]/transfer/[peerId]/` exists. | Done |
| **2. Move existing transfer page** | **From**: `apps/nully/app/[locale]/transfer/page.tsx` <br> **To**: `apps/nully/app/[locale]/transfer/[peerId]/page.tsx` | Task 1 completed | After moving the file, running `pnpm dev` should show no errors. Visiting `/transfer/some-id` should display the existing page content (it wont be functional yet). | Done |

### Phase 2: Core Logic Implementation

| Task Description | Target Files & Paths | Dependencies/Preconditions | Test Conditions | Status |
| :--- | :--- | :--- | :--- | :--- |
| **3. Create new transfer page for redirection** | `apps/nully/app/[locale]/transfer/page.tsx` (new file) | Task 2 completed | Visiting `/transfer` should not yet redirect, but the new empty page component should be rendered without errors. | Done |
| **4. Implement redirection logic** | `apps/nully/app/[locale]/transfer/page.tsx` | Task 3 completed | Visiting `/transfer` should now automatically redirect the user to a new URL like `/transfer/unique-id`. The page content should load correctly at the new URL. | Done |
| **5. Modify `usePeerConnection` to accept an initial ID** | `apps/nully/hooks/use-peer-connection.ts` | None | The hook should be updated to accept an optional `peerId`. If provided, it should use that ID. If not, it should generate a new one. This will be fully testable in the next phase. | Done |

### Phase 3: Integration & Cleanup

| Task Description | Target Files & Paths | Dependencies/Preconditions | Test Conditions | Status |
| :--- | :--- | :--- | :--- | :--- |
| **6. Update dynamic transfer page to use URL parameter** | `apps/nully/app/[locale]/transfer/[peerId]/page.tsx` | Task 5 completed | The page should now extract the `peerId` from the URL and pass it to the `usePeerConnection` hook. The shareable URL displayed on the page should match the current URL. | Done |
| **7. Update `getShareableUrl` to use the correct base path** | `apps/nully/app/[locale]/transfer/[peerId]/page.tsx` | Task 6 completed | The shareable URL should correctly point to `/join/[peerId]`, not `/transfer/join/[peerId]`. | Done |
| **8. Refactor and simplify the new transfer page** | `apps/nully/app/[locale]/transfer/[peerId]/page.tsx` | Task 6 completed | Remove the now-redundant `getShareableUrl` function and use the windows current location directly. | Done |

### Phase 4: Validation

| Task Description | Target Files & Paths | Dependencies/Preconditions | Test Conditions | Status |
| :--- | :--- | :--- | :--- | :--- |
| **9. Full feature validation** | `apps/nully/app/[locale]/transfer/[peerId]/page.tsx` | All previous tasks completed | 1. Visit `/transfer`.<br>2. Confirm redirection to `/transfer/[peerId]`.<br>3. Copy the shareable join link.<br>4. Open the join link in a new tab; confirm connection.<br>5. Refresh the `/transfer/[peerId]` page; confirm the URL and `peerId` remain the same and the connection can be re-established. | Done |

