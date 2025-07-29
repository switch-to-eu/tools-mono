# 🎯 **Implementation Plan: Hour-Based Availability for Plotty**

**Feature**: Add optional hour-based scheduling to Plotty polls
**Date**: 2025-07-24
**Timeline**: 15 development days
**Approach**: Non-destructive extension of existing functionality

## **📋 Requirements Summary**

- **Time Intervals**: 30-minute slots
- **Time Format**: 24-hour notation (09:00, 14:30)
- **UI Components**: Start time + duration dropdowns (not start/end)
- **Duration Options**: 1h, 2h, 3h, 4h, 5h, 6h, 7h, 8h
- **Default Behavior**: All-day mode with checkbox to enable specific times
- **Grid Display**: Simple expansion - no virtual scrolling initially
- **Mobile**: Keep current responsive approach
- **Timezone**: Local time only (no timezone support)
- **Pattern**: Selected time range applies to ALL selected dates

## **🏗️ Core Implementation Strategy**

**Non-Destructive Principles:**
- Extend existing interfaces without breaking current structure
- Add optional time properties with safe defaults
- Preserve all existing functionality while adding new capabilities
- Default to all-day mode with opt-in time selection

---

## **📋 Phase 1: Data Foundation (Days 1-2)**

### **Task 1.1: Extend Core Data Interfaces** - **Done**
- **Description**: Add optional time-related properties to existing interfaces
- **Target Files**:
  - `apps/plotty/lib/interfaces.ts`
- **Dependencies**: None
- **Changes**:
  ```typescript
  // Add to DecryptedPoll interface
  timeSlots?: string[]; // ["09:00", "09:30", "10:00", "10:30", "11:00"]
  allowHourSelection?: boolean; // Default false

  // Extend Participant availability
  availability: Record<string, boolean | string[]>; // Support both formats
  ```
- **Test Condition**: Create a new poll and verify existing all-day functionality still works

### **Task 1.2: Update Form Schema with Time Options** - **Done**
- **Description**: Extend poll creation schema to include optional time selection
- **Target Files**:
  - `apps/plotty/lib/schemas.ts`
- **Dependencies**: Task 1.1 completion
- **Changes**:
  ```typescript
  const pollSchema = z.object({
    // ... existing fields
    enableTimeSelection: z.boolean().default(false),
    startTime: z.string().optional(), // "09:00"
    duration: z.number().optional(),  // Duration in hours (1, 2, 3, etc.)
  });
  ```
- **Test Condition**: Submit poll form with both all-day and timed configurations, verify both validate correctly

### **Task 1.3: Create Time Utility Functions** - **Done**
- **Description**: Build helper functions for time slot generation and formatting
- **Target Files**:
  - `apps/plotty/lib/time-utils.ts` (new file)
- **Dependencies**: None
- **Functions**:
  - `generateTimeSlots(startTime: string, durationHours: number): string[]`
  - `formatTimeSlot(time: string): string`
  - `isValidTimeRange(start: string, duration: number): boolean`
  - `calculateEndTime(start: string, duration: number): string`
- **Test Condition**: Generate time slots for 09:00 + 3h duration and verify proper 24h format and 30min intervals

---

## **📱 Phase 2: UI Components Creation (Days 3-4)**

### **Task 2.1: Create Time Range Selector Component** - **Done**
- **Description**: Build start time + duration dropdown component for poll creation
- **Target Files**:
  - `packages/ui/src/form/time-range-selector.tsx` (new file)
  - `packages/ui/src/form/index.ts` (update exports)
- **Dependencies**: None
- **Features**:
  - Start time dropdown (24h format, 30min intervals: 00:00, 00:30, 01:00...)
  - Duration dropdown (1h, 2h, 3h, 4h, 5h, 6h, 7h, 8h)
  - Automatic end time calculation and display
  - Validation (no overflow past 24:00)
  - Proper TypeScript interfaces
- **Test Condition**: Select start time 09:00 + 3h duration, verify shows "09:00 - 12:00" and generates correct time slots

### **Task 2.2: Create Time Selection Toggle Component** - **Done**
- **Description**: Build checkbox for enabling specific times (default unchecked)
- **Target Files**:
  - `packages/ui/src/form/time-selection-toggle.tsx` (new file)
  - `packages/ui/src/form/index.ts` (update exports)
- **Dependencies**: None
- **Features**:
  - Checkbox with "Enable specific times" label
  - Clear visual indication when enabled
  - Form integration support
- **Test Condition**: Toggle checkbox and verify form state updates correctly

### **Task 2.3: Create Time Slot Preview Component** - **Done**
- **Description**: Display component showing selected time slots in poll form
- **Target Files**:
  - `apps/plotty/components/time-slot-preview.tsx` (new file)
- **Dependencies**: Task 1.3 (time utilities)
- **Features**:
  - Display generated time slots (e.g., "09:00, 09:30, 10:00, 10:30, 11:00, 11:30")
  - Show calculated time range (e.g., "09:00 - 12:00")
  - Show "applies to all dates" message
  - Clean, readable format
- **Test Condition**: Display time slots for start time + duration and verify proper formatting

---

## **🔧 Phase 3: Poll Form Integration (Days 5-6)**

### **Task 3.1: Extend Poll Form with Time Selection**
- **Description**: Integrate time selection components into existing poll creation form
- **Target Files**:
  - `apps/plotty/components/poll-form.tsx`
- **Dependencies**: Tasks 2.1, 2.2, 2.3
- **Integration Points**:
  - Add checkbox after date selection
  - Show time range selector (start time + duration) when checkbox enabled
  - Display time slot preview when configured
  - Maintain existing date-only flow as default
- **Test Condition**: Create polls in both all-day and timed modes, verify form submission and data structure

### **Task 3.2: Update Form Validation and Submission**
- **Description**: Modify form handling to process time data alongside existing date data
- **Target Files**:
  - `apps/plotty/components/poll-form.tsx`
- **Dependencies**: Task 1.2 (updated schemas)
- **Changes**:
  - Extend form validation for start time + duration
  - Generate time slots during form submission using start time + duration
  - Validate time ranges don't exceed 24:00
  - Preserve existing submission flow for all-day polls
- **Test Condition**: Submit forms with various time configurations and verify proper server-side data storage

---

## **🎯 Phase 4: Availability Grid Transformation (Days 7-9)**

### **Task 4.1: Extend Grid Data Processing**
- **Description**: Update time slot generation logic to handle both date-only and time-based slots
- **Target Files**:
  - `apps/plotty/components/availability-grid.tsx` (lines 58-78)
- **Dependencies**: Task 1.3 (time utilities)
- **Logic**:
  ```typescript
  // Generate slots based on poll configuration
  timeSlots: poll.allowHourSelection && poll.timeSlots
    ? poll.dates.flatMap(date =>
        poll.timeSlots.map(time => ({
          id: `${date}T${time}`,
          date: date,
          time: time,
          displayName: `${formatDate(date)} ${time}`
        }))
      )
    : poll.dates.map((date) => ({
        id: date,
        date: date,
        time: null,
        displayName: formatDate(date)
      }))
  ```
- **Test Condition**: Load both all-day and timed polls, verify correct grid column generation

### **Task 4.2: Update Grid Column Headers**
- **Description**: Modify column headers to display time information when available
- **Target Files**:
  - `apps/plotty/components/availability-grid.tsx` (lines 298-332)
- **Dependencies**: Task 4.1
- **Changes**:
  - Show date + time for timed polls (e.g., "Mon 14 09:00")
  - Show "All day" for date-only polls
  - Adjust column width as needed for time display
- **Test Condition**: View grid headers for both poll types, verify proper time formatting and responsive layout

### **Task 4.3: Extend Availability Toggle Logic**
- **Description**: Update availability selection to handle time-based slots
- **Target Files**:
  - `apps/plotty/components/availability-grid.tsx` (lines 95-103, 337-338)
- **Dependencies**: Task 4.1
- **Logic**:
  - Time-based polls: Toggle individual time slots
  - All-day polls: Toggle entire dates (existing behavior)
  - Maintain backward compatibility
- **Test Condition**: Toggle availability in both poll types, verify proper data persistence and real-time updates

---

## **🔄 Phase 5: Backend Integration (Days 10-11)**

### **Task 5.1: Update tRPC Procedures**
- **Description**: Extend API endpoints to handle time-based poll data
- **Target Files**:
  - `apps/plotty/server/api/routers/poll.ts`
- **Dependencies**: Tasks 1.1, 1.2 (data models and schemas)
- **Changes**:
  - Support optional time fields in poll creation (startTime, duration)
  - Handle time-based availability data in voting
  - Maintain backward compatibility for existing polls
- **Test Condition**: Create and retrieve polls via API with time data, verify encryption/decryption works

### **Task 5.2: Update Poll Loading and Display Logic**
- **Description**: Modify poll loading hooks to handle time-based data
- **Target Files**:
  - `apps/plotty/hooks/useLoadPoll.ts`
  - `apps/plotty/hooks/useVote.ts`
- **Dependencies**: Task 5.1
- **Changes**:
  - Process time slots during poll loading
  - Handle time-based availability in voting logic
  - Preserve existing all-day poll behavior
- **Test Condition**: Load timed polls and verify real-time updates work correctly with time slots

---

## **✨ Phase 6: Display and Polish (Days 12-13)**

### **Task 6.1: Update Poll Header for Time Information**
- **Description**: Enhance poll information display to show time slot counts
- **Target Files**:
  - `apps/plotty/components/poll-header.tsx`
- **Dependencies**: Task 1.3 (time utilities)
- **Changes**:
  - Show "X time slots across Y dates" for timed polls
  - Show time range info (e.g., "09:00 - 12:00 daily")
  - Show "X dates" for all-day polls (existing behavior)
  - Update best time display to include time information
- **Test Condition**: View poll headers for both poll types, verify accurate counts and best time calculations

### **Task 6.2: Update Best Time Calculation**
- **Description**: Enhance best available time logic for time-based polls
- **Target Files**:
  - `apps/plotty/hooks/useLoadPoll.ts` (best time calculation logic)
- **Dependencies**: Task 1.3
- **Changes**:
  - Calculate best time slots for timed polls
  - Maintain existing best date calculation for all-day polls
  - Handle edge cases (ties, no availability)
- **Test Condition**: Create timed poll with varied availability, verify best time highlights correct time slots

### **Task 6.3: Add Internationalization for Time Features**
- **Description**: Add translation keys for new time-related UI elements
- **Target Files**:
  - `apps/plotty/messages/en.json`
  - `apps/plotty/messages/nl.json`
- **Dependencies**: All UI tasks completion
- **New Keys**:
  ```json
  {
    "enableSpecificTimes": "Enable specific times",
    "startTime": "Start time",
    "duration": "Duration",
    "timeRange": "Time range",
    "timeSlots": "Time slots",
    "appliesAllDates": "This time range applies to all selected dates",
    "timeSlotsCount": "{count} time slots across {dates} dates",
    "hours": "{count}h"
  }
  ```
- **Test Condition**: Switch languages and verify all time-related text displays correctly

---

## **🧪 Phase 7: Testing and Validation (Days 14-15)**

### **Task 7.1: Comprehensive Feature Testing**
- **Description**: Test all combinations of poll types and user interactions
- **Target Files**: N/A (testing phase)
- **Dependencies**: All previous phases
- **Test Conditions**:
  - Create all-day polls (legacy behavior preserved)
  - Create timed polls with various start times and durations
  - Test edge cases: start time 22:00 + 4h duration (should handle properly)
  - Vote on both poll types from multiple participants
  - Verify real-time updates work for both poll types
  - Test mobile responsiveness with time slots
  - Verify admin functions work with both poll types

### **Task 7.2: Performance and Edge Case Testing**
- **Description**: Test with complex time configurations and edge cases
- **Target Files**: N/A (testing phase)
- **Dependencies**: Task 7.1
- **Test Conditions**:
  - Create polls with 10+ dates and 8h duration (verify grid performance)
  - Test with single time slot polls (30min duration)
  - Test with maximum duration (8h) and various start times
  - Verify time range calculations don't exceed 24:00
  - Test dropdown interactions and validation
  - Verify encryption/decryption with time datasets

---

## **📊 Implementation Summary**

**Total Timeline**: 15 development days
**Risk Level**: Low (non-destructive approach maintains all existing functionality)
**Files Modified**: 12 existing files
**Files Created**: 4 new files
**Backward Compatibility**: 100% (all existing polls continue to work)

## **🎯 Key Success Metrics**

1. **Preservation**: All existing all-day poll functionality remains unchanged
2. **Extension**: New timed polls provide 30-minute granularity with 24h format
3. **Simplicity**: Start time + duration approach is more intuitive than start/end times
4. **Usability**: Dropdown selectors with clear time range display
5. **Real-time**: SSE updates work seamlessly for both poll types

## **🚀 Ready for Implementation**

This plan provides a clear, non-destructive path to add hour-based availability using a start time + duration approach. This simplifies the UX significantly while maintaining all existing functionality.

**Example User Flow**:
1. Create poll, select dates
2. Check "Enable specific times"
3. Select start time: "09:00"
4. Select duration: "3h"
5. Preview shows: "09:00 - 12:00" with time slots "09:00, 09:30, 10:00, 10:30, 11:00, 11:30"
6. Time range applies to all selected dates

**Next Step**: Begin with Phase 1, Task 1.1 - extending the core data interfaces.