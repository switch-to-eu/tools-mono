"use client";

import React from "react";
import { Clock, Zap, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";

interface TimeBlockSelectorProps {
  selectedTimes: string[];
  duration: number;
  onTimeToggle: (time: string) => void;
  onDurationChange: (duration: number) => void;
  onClearAll?: () => void;
  onPresetSelect?: (times: string[], duration: number) => void;
  className?: string;
}

// Generate half-hourly time slots from 6:00 to 23:30 (24-hour format)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 23; hour++) {
    // Add :00 slot
    const timeHour = `${hour.toString().padStart(2, '0')}:00`;
    slots.push({ value: timeHour, display: timeHour });
    
    // Add :30 slot (except for the last hour to avoid going past 23:30)
    if (hour < 23) {
      const timeHalfHour = `${hour.toString().padStart(2, '0')}:30`;
      slots.push({ value: timeHalfHour, display: timeHalfHour });
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Quick preset configurations (24-hour format with half-hours)
const timePresets = [
  { 
    name: "Morning Meeting", 
    times: ["09:00", "09:30", "10:00", "10:30", "11:00"], 
    duration: 1,
    icon: "🌅"
  },
  { 
    name: "Lunch Break", 
    times: ["12:00", "12:30", "13:00", "13:30"], 
    duration: 1,
    icon: "🍽️"
  },
  { 
    name: "Afternoon Block", 
    times: ["14:00", "14:30", "15:00", "15:30", "16:00"], 
    duration: 1,
    icon: "☀️"
  },
  { 
    name: "Evening Hours", 
    times: ["18:00", "18:30", "19:00", "19:30", "20:00"], 
    duration: 1,
    icon: "🌆"
  },
  { 
    name: "Business Hours", 
    times: ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"], 
    duration: 1,
    icon: "💼"
  },
];

const durationOptions = [
  { value: 1, label: "1h" },
  { value: 2, label: "2h" },
  { value: 3, label: "3h" },
  { value: 4, label: "4h" },
];

export const TimeBlockSelector: React.FC<TimeBlockSelectorProps> = ({
  selectedTimes,
  duration,
  onTimeToggle,
  onDurationChange,
  onClearAll,
  onPresetSelect,
  className
}) => {
  const handlePresetClick = (preset: typeof timePresets[0]) => {
    console.log('Preset clicked:', preset.name, 'Times:', preset.times);
    
    if (onPresetSelect) {
      // Use dedicated preset handler for better reliability
      onPresetSelect(preset.times, preset.duration);
    } else {
      // Fallback to individual toggles
      console.log('Using fallback toggle method');
      if (onClearAll) {
        onClearAll();
      }
      onDurationChange(preset.duration);
      
      setTimeout(() => {
        preset.times.forEach(time => {
          console.log('Toggling time:', time);
          onTimeToggle(time);
        });
      }, 100);
    }
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      // Fallback: toggle each time off
      [...selectedTimes].forEach(time => onTimeToggle(time));
    }
  };

  const generatePreview = () => {
    return selectedTimes.map(time => {
      const [hour, minute] = time.split(':').map(Number);
      const endHour = hour + duration;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      return `${time}-${endTime}`;
    }).sort();
  };

  const preview = generatePreview();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Quick Presets */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Zap className="h-4 w-4 text-purple-500" />
          Quick Time Patterns
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {timePresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-100 hover:border-purple-200 transition-all text-left group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">{preset.icon}</span>
              <div>
                <div className="font-medium text-sm text-purple-900">{preset.name}</div>
                <div className="text-xs text-purple-600">
                  {preset.times.length} slots • {preset.duration}h each
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selector */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">
          Duration per time slot
        </Label>
        <div className="flex gap-2">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onDurationChange(option.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                duration === option.value
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Block Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            Available Time Slots
          </Label>
          {selectedTimes.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-50 transition-all"
            >
              <X className="h-3 w-3 mr-1 inline" />
              Clear All
            </button>
          )}
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
          {timeSlots.map((slot) => {
            const isSelected = selectedTimes.includes(slot.value);
            
            return (
              <button
                key={slot.value}
                type="button"
                onClick={() => onTimeToggle(slot.value)}
                className={cn(
                  "h-10 flex flex-col justify-center p-1 text-xs rounded-md transition-all",
                  isSelected 
                    ? "bg-purple-600 text-white shadow-sm hover:bg-purple-700" 
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                )}
              >
                <div className="font-medium">{slot.display}</div>
                {isSelected && (
                  <div className="text-xs opacity-90">
                    +{duration}h
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 bg-purple-50 p-3 rounded-lg border border-purple-100">
          💡 Click time slots to select when your event can happen. Each slot will be {duration} hour{duration > 1 ? 's' : ''} long.
        </p>
      </div>

      {/* Live Preview */}
      {preview.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            Selected Time Ranges ({preview.length})
          </Label>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex flex-wrap gap-2">
              {preview.map((range, index) => (
                <span
                  key={range}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-600 text-white shadow-sm"
                >
                  {range} ({duration}h)
                </span>
              ))}
            </div>
            <p className="text-sm text-purple-800 mt-3">
              ✨ These time ranges will apply to all selected dates
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

TimeBlockSelector.displayName = "TimeBlockSelector";