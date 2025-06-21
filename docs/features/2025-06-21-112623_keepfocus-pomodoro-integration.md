# KeepFocus Pomodoro Integration Feature Plan

**Document ID**: `2025-06-21-112623_keepfocus-pomodoro-integration`
**Created**: 2025-06-21 11:26:23
**Status**: Planning Phase
**Priority**: High

## 📋 **Feature Overview**

Integration of full todo-list management with Pomodoro timer functionality into the existing KeepFocus app, maintaining the privacy-first approach with local storage and adding internationalization support.

## 🎯 **Requirements Summary**

- **Storage**: Local storage only (no database integration)
- **Authentication**: Single-user application (no auth required)
- **Feature Scope**: Maintain ALL existing quiet-todo-pomodoro features
- **Approach**: Minimally invasive to existing KeepFocus codebase
- **Internationalization**: Support English + Dutch (matching existing i18n setup)
- **UI Framework**: Leverage existing monorepo UI components + extend as needed

## 🏗️ **Implementation Game Plan**

### **Phase 1: UI Components Foundation**
*Estimated Time: 2-3 hours*

#### 1.1 Add Missing Core UI Components to Shared Package ✅ COMPLETED
**File**: `packages/ui/src/components/`

**Required Components to Add:**
- `progress.tsx` - For timer display (copy from quiet-todo-pomodoro) ✅
- `switch.tsx` - For settings toggles (copy from quiet-todo-pomodoro) ✅
- `separator.tsx` - For UI sections (copy from quiet-todo-pomodoro) ✅
- Verify existing `checkbox.tsx` compatibility ✅

**Actions:**
1. Copy component files from `quiet-todo-pomodoro/src/components/ui/` to `packages/ui/src/components/` ✅
2. Update import paths to use monorepo structure ✅
3. Ensure components follow monorepo naming conventions ✅
4. ~~Update `packages/ui/src/components/index.ts` with new exports~~ **NOT NEEDED** - Uses direct imports
5. Added missing Radix UI dependencies to `packages/ui/package.json` ✅
6. Added missing exports for `blocks/*` and `form/*` to `packages/ui/package.json` ✅

**Component Import Pattern Discovered:**
- Components are imported directly: `import { Button } from "@workspace/ui/components/button"`
- No index.ts file needed - each component is in its own file
- Package.json exports handle path mapping with `"./components/*": "./src/components/*.tsx"`

#### 1.2 Create Application-Specific Components ✅ COMPLETED
**File**: `apps/keepfocus/components/` (CORRECTED LOCATION)

**🔄 ARCHITECTURAL CORRECTION MADE:**
- **Types moved to correct location**: `apps/keepfocus/lib/types.ts` ✅
- **Components moved to correct location**: `apps/keepfocus/components/` ✅
- **Rule updated**: `.cursor/rules/monorepo-separation-of-concerns.mdc` ✅
- **Learning**: Domain-specific props → APP-SPECIFIC, not shared! ✅

**Components Created:**
- `pomodoro-timer.tsx` - Main timer component ✅
- `task-item.tsx` - Individual task component ✅
- `todo-list.tsx` - Task list container ✅
- `pomodoro-settings-dialog.tsx` - Settings configuration ⏳ (next)

**Actions Completed:**
1. Migrate logic from quiet-todo-pomodoro components ✅
2. Adapt to use monorepo UI components (via `@workspace/ui/components/*`) ✅
3. Remove direct localStorage calls (will be handled by hooks) ✅
4. Update import paths for correct monorepo structure ✅

**Key Learning:** Components with `pomodoros`, `activeTask`, `settings` props are BUSINESS LOGIC → belong in app, not shared packages!

### **Phase 2: Business Logic & Hooks**
*Estimated Time: 3-4 hours*

#### 2.1 Create Custom Hooks Package ✅ COMPLETED
**File**: `apps/keepfocus/hooks/` (CORRECTED LOCATION)

**🔄 ARCHITECTURAL CORRECTION APPLIED:**
- Hooks are business logic → belong in app, not shared packages
- Following monorepo separation of concerns rule

**Hooks Created:**
- `use-pomodoro-settings.tsx` - Settings management with localStorage ✅
- `use-pomodoro-timer.tsx` - Timer logic and state management ✅
- `use-tasks.tsx` - Task CRUD operations with localStorage ✅
- `use-notifications.tsx` - Browser notification handling ✅

**Actions Completed:**
1. Extracted hook logic from quiet-todo-pomodoro ✅
2. Implemented localStorage persistence ✅
3. Added proper TypeScript interfaces ✅
4. Implemented browser notification permissions ✅
5. Context providers for settings and tasks ✅
6. Comprehensive timer logic with phase transitions ✅
7. Sound and visual notifications ✅

#### 2.2 Update Existing Components ✅ COMPLETED
**Files**: `apps/keepfocus/components/`

**Updated Components:**
- `pomodoro-timer.tsx` - Refactored to use new hooks ✅
- `todo-list.tsx` - Integrated with useTasks hook ✅
- `task-item.tsx` - Working correctly with new structure ✅

**Actions Completed:**
1. Removed duplicate timer logic from components ✅
2. Integrated usePomodoroTimer hook ✅
3. Integrated useTasks hook with full CRUD operations ✅
4. Added proper loading states ✅
5. Maintained existing UI/UX patterns ✅
6. TypeScript compilation successful ✅

### **Phase 2.3: Demo Page Creation ✅ COMPLETED**
**File**: `apps/keepfocus/app/[locale]/focus/page.tsx`

**Demo Page Features:**
- Full Pomodoro timer with all phases ✅
- Task management with localStorage persistence ✅
- Active task integration with timer ✅
- Context providers properly structured ✅
- Responsive design with instructions ✅
- TypeScript compilation successful ✅

**Ready for Testing:**
- Visit `/focus` route to test functionality
- Add tasks, set active task, start timer
- Verify localStorage persistence
- Test browser notifications (if permissions granted)
- Navigation link added to header (🍅 Focus button)

## 🎉 **Phase 2 Complete Summary**

### **What Was Built:**
✅ **4 Custom Hooks** in `apps/keepfocus/hooks/`:
- `use-pomodoro-settings.tsx` - Settings management with localStorage
- `use-pomodoro-timer.tsx` - Complete timer logic with phase transitions
- `use-tasks.tsx` - Full CRUD operations for tasks
- `use-notifications.tsx` - Browser notifications with fallbacks

✅ **3 Updated Components** in `apps/keepfocus/components/`:
- `pomodoro-timer.tsx` - Fully functional timer with all phases
- `todo-list.tsx` - Integrated with hooks, localStorage persistence
- `task-item.tsx` - Working correctly with new structure

✅ **Demo Page** at `/focus`:
- Complete Pomodoro functionality
- Task management with active task integration
- Responsive design with instructions
- Context providers properly structured

✅ **Navigation Integration**:
- Focus button added to header navigation
- Mobile navigation support

### **Key Features Working:**
- ⏱️ 25-minute Pomodoro sessions with 5/15-minute breaks
- 📝 Task creation, editing, completion, deletion
- 🎯 Active task selection and pomodoro counting
- 💾 localStorage persistence (tasks, settings, active task)
- 🔊 Sound and visual notifications
- 📱 Responsive design
- 🎨 Phase-based UI colors and animations
- 📊 Progress tracking and statistics

### **Technical Achievements:**
- ✅ Proper separation of concerns (business logic in app, not shared packages)
- ✅ TypeScript compilation with no errors
- ✅ React Context patterns for state management
- ✅ localStorage error handling and fallbacks
- ✅ Browser notification permission handling
- ✅ Comprehensive timer logic with automatic phase transitions
- ✅ Integration with existing KeepFocus UI patterns

### **Phase 3: Internationalization Setup**
*Estimated Time: 1-2 hours*

#### 3.1 Add Translation Files
**Files**:
- `apps/keepfocus/messages/en.json` (update existing)
- `apps/keepfocus/messages/nl.json` (update existing)

**Translation Keys to Add:**
```
pomodoro: {
  timer: { ... },
  tasks: { ... },
  settings: { ... },
  notifications: { ... }
}
```

#### 3.2 Update Translation Usage
**Files**: Components in `packages/ui/src/blocks/`

**Actions:**
1. Replace hardcoded strings with translation keys
2. Use `useTranslations` hook from next-intl
3. Ensure all user-facing text is translatable

### **Phase 4: KeepFocus App Integration**
*Estimated Time: 2-3 hours*

#### 4.1 Create New Focus Page Route
**File**: `apps/keepfocus/app/[locale]/focus/page.tsx` (new)

**Actions:**
1. Create main focus page layout
2. Import and use new block components
3. Implement responsive grid layout (todo list + timer)
4. Add privacy statement footer
5. Use existing KeepFocus styling patterns

#### 4.2 Update Navigation
**File**: `apps/keepfocus/app/[locale]/layout.tsx`

**Actions:**
1. Add navigation link to focus page
2. Update meta tags for focus functionality
3. Ensure consistent header/navigation

#### 4.3 Update Home Page
**File**: `apps/keepfocus/app/[locale]/page.tsx`

**Actions:**
1. Add feature card for Pomodoro functionality
2. Add navigation button to focus page
3. Update feature descriptions

### **Phase 5: Storage & Utilities**
*Estimated Time: 1-2 hours*

#### 5.1 Create Storage Utilities
**File**: `packages/ui/src/lib/storage.ts` (new)

**Utilities to Create:**
- `loadTasks()` - Load tasks from localStorage
- `saveTasks()` - Save tasks to localStorage
- `loadSettings()` - Load settings from localStorage
- `saveSettings()` - Save settings to localStorage

#### 5.2 Create Timer Utilities
**File**: `packages/ui/src/lib/timer-utils.ts` (new)

**Utilities to Create:**
- `formatTime()` - Format seconds to MM:SS
- `getNextPhase()` - Calculate next timer phase
- `playNotificationSound()` - Audio notification helper

### **Phase 6: Package Dependencies**
*Estimated Time: 30 minutes*

#### 6.1 Update Package Dependencies
**File**: `packages/ui/package.json`

**Dependencies to Add:**
- Any missing Radix UI components used by new components
- Ensure `date-fns` is available if needed

#### 6.2 Update KeepFocus Dependencies
**File**: `apps/keepfocus/package.json`

**Actions:**
1. Verify all required dependencies are present
2. No new dependencies should be needed (using shared packages)

### **Phase 7: Testing & Polish**
*Estimated Time: 2-3 hours*

#### 7.1 Component Testing
**Actions:**
1. Test all timer functionality (work/break cycles)
2. Test task CRUD operations
3. Test settings persistence
4. Test browser notifications
5. Test responsive design

#### 7.2 Integration Testing
**Actions:**
1. Verify no conflicts with existing KeepFocus functionality
2. Test i18n functionality in both languages
3. Test localStorage persistence across browser sessions
4. Verify accessibility features

#### 7.3 Cross-browser Testing
**Actions:**
1. Test notification permissions in different browsers
2. Test audio playback fallbacks
3. Verify localStorage compatibility

## 📁 **File Structure Impact**

### **New Files to Create:**
```
packages/ui/src/
├── components/
│   ├── progress.tsx
│   ├── switch.tsx
│   └── separator.tsx
├── blocks/
│   ├── pomodoro-timer.tsx
│   ├── task-item.tsx
│   ├── todo-list.tsx
│   └── pomodoro-settings-dialog.tsx
├── hooks/
│   ├── use-pomodoro-settings.tsx
│   ├── use-pomodoro-timer.tsx
│   ├── use-tasks.tsx
│   └── use-notifications.tsx
├── types/
│   ├── task.ts
│   ├── pomodoro-settings.ts
│   └── timer.ts
└── lib/
    ├── storage.ts
    └── timer-utils.ts

apps/keepfocus/
└── app/[locale]/
    └── focus/
        └── page.tsx
```

### **Files to Modify:**
```
packages/ui/src/components/index.ts
packages/ui/src/blocks/index.ts
packages/ui/src/hooks/index.ts
apps/keepfocus/messages/en.json
apps/keepfocus/messages/nl.json
apps/keepfocus/app/[locale]/layout.tsx
apps/keepfocus/app/[locale]/page.tsx
```

### **Files to Leave Untouched:**
- All existing KeepFocus database/tRPC functionality
- All existing KeepFocus components
- All existing KeepFocus API routes
- All existing UI package components (except additions)

## 🔧 **Technical Specifications**

### **Storage Schema (localStorage)**
```
Keys:
- 'keepfocus-tasks' - Task array
- 'keepfocus-pomodoro-settings' - Settings object
- 'keepfocus-active-task' - Currently active task ID
```

### **Component Props Interfaces**
- All components must accept proper TypeScript interfaces
- Use generic types where appropriate
- Maintain compatibility with existing UI components

### **Performance Considerations**
- Timer updates should not cause unnecessary re-renders
- localStorage operations should be debounced for settings
- Use React.memo for expensive components

### **Accessibility Requirements**
- All interactive elements must be keyboard accessible
- Timer should announce state changes to screen readers
- Proper ARIA labels for all controls

## 🚀 **Deployment Checklist**

- [ ] All new components render without errors
- [ ] Timer functionality works correctly
- [ ] Task CRUD operations persist
- [ ] Settings save and load properly
- [ ] Notifications work (with permissions)
- [ ] Both languages display correctly
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile
- [ ] No conflicts with existing KeepFocus features
- [ ] localStorage handles edge cases gracefully

## 📝 **Notes for Developer**

1. **Minimally Invasive Approach**: This plan specifically avoids touching existing KeepFocus database schemas, tRPC routes, or core functionality. The focus page is entirely separate.

2. **Monorepo Architecture**: Follow established patterns in the monorepo. All reusable components go in `packages/ui/`, app-specific logic stays in `apps/keepfocus/`.

3. **Component Hierarchy**: Block components should compose smaller UI components. Keep business logic in hooks, not components.

4. **Error Handling**: Implement proper error boundaries and fallbacks for localStorage operations and browser permissions.

5. **Progressive Enhancement**: Ensure core functionality works even if notifications are denied or localStorage is unavailable.

## 🔗 **Related Documentation**
- [Creating New Apps Guide](../creating-new-apps.md)
- [Turborepo Docs](https://turbo.build/repo/docs)
- Original quiet-todo-pomodoro source code in `/quiet-todo-pomodoro/`