# 🎯 **Updated Implementation Plan: Multiple Start Times with Fixed Duration for Plotty**

**Feature**: Add optional hour-based scheduling with multiple start time selection
**Date**: 2025-01-25
**Timeline**: 12 development days
**Approach**: Non-destructive extension of existing functionality

## **📋 Updated Requirements Summary - HUMAN-CENTERED DESIGN**

- **Time Intervals**: 30-minute slots (00 or 30 minutes)
- **Time Format**: 24-hour notation with simple inputs
- **UI Pattern**: **"+ Add Time" button approach - SIMPLE & INTUITIVE**
- **Individual Time Slots**: Each slot has start time (hour + minutes only)
- **Start Time Input**: Hour dropdown (0-23) + Minutes toggle (00/30)
- **Duration Setting**: Single duration (1h-8h) applies to ALL time slots
- **Default Behavior**: All-day mode with checkbox to enable specific times
- **Logic**: Fixed duration + multiple start times = multiple time ranges
- **Pattern**: Time slots apply to ALL selected dates
- **Mobile**: Clean, simple form inputs that work perfectly on mobile
- **Timezone**: Local time only (no timezone support)

## **🏗️ Core Implementation Strategy**

**Non-Destructive Principles:**
- Extend existing interfaces without breaking current structure
- Add optional time properties with safe defaults
- Preserve all existing functionality while adding new capabilities
- Default to all-day mode with opt-in time selection

**New SIMPLE UX Flow:**
1. User checks "Enable specific times"
2. User sets **Fixed Duration** (e.g., 2h) - applies to all slots
3. User sees clean interface with "+ Add Time" button
4. User clicks "+ Add Time" → New start time slot appears with:
   - **Hour dropdown** (0-23)
   - **Minutes toggle** (00/30)
   - **Remove button** (×)
5. User can add multiple start times easily
6. Each slot shows preview: "09:00-11:00" (using fixed duration)
7. All time slots apply to all selected dates

---

## **📋 Phase 1: Data Foundation Revision (Days 1-2)**

### **Task 1.1: Update Core Data Interfaces** - **Done**
- **Description**: Revise time-related properties to support multiple start times with fixed duration
- **Target Files**:
  - `apps/plotty/lib/interfaces.ts`
- **Dependencies**: None
- **Changes**:
  ```typescript
  // Add to DecryptedPoll interface
  fixedDuration?: number; // 2 (hours) - applies to all start times
  selectedStartTimes?: string[]; // ["09:00", "14:00", "19:00"]
  allowHourSelection?: boolean; // Default false

  // Generated final time slots from duration + start times
  timeSlots?: string[]; // Generated: ["09:00-11:00", "14:00-16:00", "19:00-21:00"]
  ```
- **Test Condition**: Create poll with duration=2h and start times ["09:00", "14:00"], verify slots generated correctly

### **Task 1.2: Update Form Schema for Multiple Start Times** - **Done**
- **Description**: Revise poll creation schema for duration + multiple start times pattern
- **Target Files**:
  - `apps/plotty/lib/schemas.ts`
- **Dependencies**: Task 1.1 completion
- **Changes**:
  ```typescript
  const pollSchema = z.object({
    // ... existing fields
    enableTimeSelection: z.boolean().default(false),
    fixedDuration: z.number().min(1).max(8).optional(), // 1-8 hours
    selectedStartTimes: z.array(z.string()).optional().default([]), // ["09:00", "14:00"]
  });
  ```
- **Test Condition**: Submit form with duration=3h and multiple start times, verify validation passes

### **Task 1.3: Update Time Utility Functions** - **Done**
- **Description**: Revise helper functions for multiple start times + fixed duration approach
- **Target Files**
  - `apps/plotty/lib/time-utils.ts`
- **Dependencies**: None
- **Functions**:
  - `generateTimeSlotsFromStartTimes(startTimes: string[], durationHours: number): string[]`
  - `formatTimeSlotRange(startTime: string, durationHours: number): string` // "09:00-11:00"
  - `validateStartTimesWithDuration(startTimes: string[], duration: number): boolean`
  - `getAvailableStartTimes(): string[]` // All 30min intervals: "00:00", "00:30", etc.
- **Test Condition**: Generate slots for ["09:00", "14:00"] + 2h duration, verify output ["09:00-11:00", "14:00-16:00"]

---

## **📱 Phase 2: UI Components Revision (Days 3-4)**

### **Task 2.1: Create Start Time Entry Component** - **Done**
- **Description**: Build simple start time component with hour/minute inputs only
- **Target Files**:
  - `packages/ui/src/form/start-time-entry.tsx` (updated from time-slot-entry.tsx)
  - `packages/ui/src/form/index.ts` (update exports)
- **Dependencies**: None
- **Features**:
  - **Hour dropdown** (0-23 with proper labels like "09 AM", "14 PM")
  - **Minutes toggle button** (00/30 - clean toggle design)
  - **Remove button** (× icon)
  - **Preview display** ("09:00-11:00" using external duration)
  - Clean, mobile-friendly layout
- **Test Condition**: Add start time, set hour/minutes, verify preview updates with external duration

### **Task 2.2: Create Start Times Manager Component** - **Done**
- **Description**: Build container component with "+ Add Time" button and list of start time entries
- **Target Files**:
  - `packages/ui/src/form/start-times-manager.tsx` (updated from time-slots-manager.tsx)
  - `packages/ui/src/form/index.ts` (update exports)
- **Dependencies**: Task 2.1 (StartTimeEntry component)
- **Features**:
  - **"+ Add Time" button** (prominent, easy to find)
  - **List of start time entries** (clean layout)
  - **Add/remove functionality** (smooth animations)
  - **Validation** (prevent overlapping times with external duration, 24:00+ times)
  - **Empty state** ("No times added yet" with helpful text)
  - Form integration with react-hook-form
- **Test Condition**: Add multiple start times, remove slots, verify no overlaps with external duration

### **Task 2.3: Update Time Slot Preview Component** - **Done**
- **Description**: Modify preview to show multiple time ranges instead of continuous slots
- **Target Files**:
  - `apps/plotty/components/time-slot-preview.tsx`
- **Dependencies**: Task 1.3 (updated time utilities)
- **Features**:
  - Display multiple time ranges (e.g., "09:00-11:00, 14:00-16:00")
  - Show count of total slots
  - Show duration applied to each slot
  - Clear formatting for readability
- **Test Condition**: Preview multiple start times with duration and verify proper range display

### **Task 2.4: Keep Time Selection Toggle Component**
- **Description**: Time selection toggle already exists and works correctly
- **Target Files**: No changes needed
- **Dependencies**: None
- **Status**: Already implemented correctly

---

## **🔧 Phase 3: Poll Form Integration Update (Days 5-6)**

### **Task 3.1: Replace Complex UI with Duration + Start Times Manager** - **Done**
- **Description**: Replace complex grid with Duration selector + simple "+ Add Time" interface
- **Target Files**:
  - `apps/plotty/components/poll-form.tsx`
- **Dependencies**: Tasks 2.1, 2.2, 2.3
- **Integration Points**:
  - Add DurationSelector component first
  - Add StartTimesManager component below duration
  - Show clean "+ Add Time" button interface for start times only
  - Duration applies to all start times
  - Update preview to show time ranges using duration + start times
  - Maintain existing toggle behavior
- **Test Condition**: Set duration, add multiple start times, verify form submission includes correct data structure

### **Task 3.2: Update Form Validation and Submission Logic** - **Done**
- **Description**: Modify form handling for duration + multiple start times pattern
- **Target Files**:
  - `apps/plotty/components/poll-form.tsx`
- **Dependencies**: Task 1.2 (updated schemas)
- **Changes**:
  - Validate duration + start times don't create overlapping slots
  - Validate no time slots exceed 24:00
  - Generate final time slots during submission
  - Preserve existing all-day submission flow
- **Test Condition**: Submit with edge cases (late start times + long duration) and verify validation

---

## **🎯 Phase 4: Availability Grid Update (Days 7-8)**

### **Task 4.1: Update Grid Data Processing for Multiple Ranges** - **Done**
- **Description**: Modify grid to handle multiple discrete time ranges per date
- **Target Files**:
  - `apps/plotty/components/availability-grid.tsx`
- **Dependencies**: Task 1.3 (updated time utilities)
- **Logic**:
  ```typescript
  // Generate slots from duration + start times
  timeSlots: poll.allowHourSelection && poll.selectedStartTimes && poll.fixedDuration
    ? poll.dates.flatMap(date =>
        poll.selectedStartTimes.map(startTime => ({
          id: `${date}T${startTime}`,
          date: date,
          startTime: startTime,
          duration: poll.fixedDuration,
          displayName: `${formatDate(date)} ${formatTimeSlotRange(startTime, poll.fixedDuration)}`
        }))
      )
    : poll.dates.map((date) => ({ /* all-day format */ }))
  ```
- **Test Condition**: Load poll with multiple start times and verify grid shows correct columns

### **Task 4.2: Update Grid Column Headers for Time Ranges** - **Done**
- **Description**: Modify headers to show time ranges instead of individual slots
- **Target Files**:
  - `apps/plotty/components/availability-grid.tsx`
- **Dependencies**: Task 4.1
- **Changes**:
  - Show date + time range for timed polls (e.g., "Mon 14 09:00-11:00")
  - Show "All day" for date-only polls  
  - Responsive column widths work for range display
  - Already implemented in previous grid update
- **Test Condition**: View grid headers and verify time ranges display correctly on mobile/desktop

### **Task 4.3: Maintain Availability Toggle Logic** - **Done**
- **Description**: Ensure availability selection works with new time range structure
- **Target Files**:
  - `apps/plotty/components/availability-grid.tsx`
- **Dependencies**: Task 4.1
- **Logic**: Each time range is an independent slot for voting
- **Changes**: Already properly implemented - handles both date-only and time-based slot IDs
- **Test Condition**: Toggle availability for time ranges and verify persistence works

---

## **🔄 Phase 5: Backend Integration (Days 9-10)**

### **Task 5.1: Update tRPC Procedures for New Data Structure** - **Done**
- **Description**: Extend API to handle duration + multiple start times
- **Target Files**:
  - `apps/plotty/server/api/routers/poll.ts` (no changes needed - uses encrypted data)
  - `apps/plotty/app/[locale]/create/page.tsx` (fixed poll creation encryption)
  - `apps/plotty/hooks/useUpdatePoll.ts` (fixed poll update encryption)
- **Dependencies**: Tasks 1.1, 1.2
- **Changes**:
  - Fixed poll creation to include fixedDuration, selectedStartTimes, allowHourSelection in encrypted data
  - Fixed poll update to include new time selection fields in encrypted data
  - Maintain backward compatibility (tRPC procedures unchanged)
- **Test Condition**: Create poll via API with new structure and verify data persistence

### **Task 5.2: Update Poll Loading for New Structure** - **Done**
- **Description**: Modify loading hooks to process new time data format
- **Target Files**:
  - `apps/plotty/hooks/useLoadPoll.ts` (updated bestTimes calculation)
  - `apps/plotty/hooks/useVote.ts` (no changes needed)
- **Dependencies**: Task 5.1
- **Changes**:
  - Updated bestTimes calculation to handle both date-only and timed polls
  - For timed polls: calculate best time slots using date+time combinations
  - Preserve all-day poll behavior for backward compatibility
  - Process multiple time ranges during poll loading
- **Test Condition**: Load polls with time ranges and verify real-time updates work

---

## **✨ Phase 6: Display and Polish (Days 11-12)**

### **Task 6.1: Update Poll Header for Time Range Display** - **Done**
- **Description**: Show summary of time ranges in poll header
- **Target Files**:
  - `apps/plotty/components/poll-header.tsx`
  - `apps/plotty/messages/en.json`
  - `apps/plotty/messages/nl.json`
- **Dependencies**: Task 1.3
- **Changes**:
  - Show time slots count (dates × start times) for timed polls
  - Display duration info (e.g., "2h duration")
  - Show best time range with date + time range display
  - Added translation keys for "timeSlots" and "duration"
- **Test Condition**: View headers for time range polls and verify accurate summaries

### **Task 6.2: Update Best Time Calculation for Ranges** - **Done**
- **Description**: Calculate best available time ranges
- **Target Files**:
  - `apps/plotty/hooks/useLoadPoll.ts`
- **Dependencies**: Task 1.3
- **Changes**:
  - Already implemented in Task 5.2 - calculates best time slots for timed polls
  - Find time range with most availability using date+time slot IDs
  - Handle ties between time ranges with sorting
  - Maintain existing best date logic for all-day polls
- **Test Condition**: Create poll with varied time range availability and verify best time detection

### **Task 6.3: Add Translations for New UI Elements** - **Done**
- **Description**: Add translation keys for duration and multiple start times UI
- **Target Files**:
  - `apps/plotty/messages/en.json` (added timeSlots, duration)
  - `apps/plotty/messages/nl.json` (added timeSlots, duration)
  - `packages/ui/src/translations/en.json` (already had required keys)
  - `packages/ui/src/translations/nl.json` (already had required keys)
- **Dependencies**: All UI tasks
- **New Keys Added**:
  ```json
  {
    "timeSlots": "time slots / tijdsloten",
    "duration": "duration / duur",
    "fixedDuration": "Duration for each time slot / Duur voor elke tijdsslot",
    "selectStartTimes": "Select start times / Selecteer starttijden",
    "enableSpecificTimes": "Enable specific times / Specifieke tijden inschakelen"
  }
  ```
- **Test Condition**: Switch languages and verify all new text displays correctly

---

## **📊 Implementation Summary**

**Total Timeline**: 12 development days (reduced from 15)
**Risk Level**: Low (non-destructive approach)
**Files Modified**: 8 existing files
**Files Created**: 2 new files (DurationSelector, StartTimesSelector)
**Files Replaced**: 1 file (time range selector logic)
**Backward Compatibility**: 100% maintained

## **🎯 Key Success Metrics**

1. **Logical UX**: Users select multiple specific start times + one duration
2. **Clear Output**: Each start time creates one time range (e.g., 09:00-11:00)
3. **Preservation**: All existing all-day functionality unchanged
4. **Flexibility**: Users can create scattered time ranges (morning + afternoon)
5. **Simplicity**: Duration set once, applies to all selected start times

## **🚀 SIMPLE & INTUITIVE User Flow Example**

1. Create poll, select dates (e.g., Jan 15, Jan 16, Jan 17)
2. Check "Enable specific times"
3. Set **Fixed Duration** = 2h (applies to all start times)
4. Click **"+ Add Time"** button
5. **First start time**: Hour=09, Minutes=00 → Shows "09:00-11:00" (2h)
6. Click **"+ Add Time"** again
7. **Second start time**: Hour=14, Minutes=30 → Shows "14:30-16:30" (2h)
8. Click **"+ Add Time"** again
9. **Third start time**: Hour=19, Minutes=00 → Shows "19:00-21:00" (2h)
10. Preview shows: "3 time slots (2h each): 09:00-11:00, 14:30-16:30, 19:00-21:00"
11. These 3 time ranges apply to all 3 dates (9 total slots)
12. Grid shows columns: "Jan 15 09:00-11:00", "Jan 15 14:30-16:30", etc.

**MUCH SIMPLER!** Users set duration once and add multiple start times. All slots have consistent duration.

**Next Step**: Begin with Phase 1, Task 1.1 - updating the core data interfaces for the new multiple start times approach.