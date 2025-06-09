"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Calendar, FileText, Clock } from "lucide-react";
import { LoadingButton } from "@workspace/ui/components/loading-button";
import { Button } from "@workspace/ui/components/button";
import { Calendar as CalendarComponent } from "@workspace/ui/blocks/calendar";
import { FormInput } from "@workspace/ui/form/form-input";
import { FormTextArea } from "@workspace/ui/form/form-textarea";
import { pollSchema, type PollFormData } from "@/lib/schemas";
import { SectionCard, SectionHeader, SectionContent } from "@workspace/ui/blocks/section-card";

interface PollFormProps {
  onSubmit: (data: PollFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitText?: string;
  initialData?: Partial<PollFormData>;
  hideMobileSubmit?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function PollForm({
  onSubmit,
  onCancel,
  isLoading = false,
  submitText = "Create Poll",
  initialData,
  hideMobileSubmit = false,
  formRef
}: PollFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      selectedDates: initialData?.selectedDates ?? [],
      expirationDays: initialData?.expirationDays ?? 30,
    },
  });

  const selectedDates = watch("selectedDates");

  const handleFormSubmit = async (data: PollFormData) => {
    await onSubmit(data);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)} className="">
      {/* Event Section - Separate Box */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={<FileText className="h-5 w-5" />}
          title="Event"
          description="Describe what you're planning"
        />
        <SectionContent>
          <div className="space-y-5">
            <FormInput<PollFormData>
              label="Title"
              name="title"
              placeholder="Monthly team meeting"
              register={register}
              error={errors.title}
              schema={pollSchema}
            />

            <FormInput<PollFormData>
              label="Location"
              name="location"
              placeholder="Coffee shop Joe's"
              register={register}
              error={errors.location}
              schema={pollSchema}
            />

            <FormTextArea<PollFormData>
              label="Description"
              name="description"
              placeholder="Hello everyone! Choose here the dates that work best for you."
              register={register}
              error={errors.description}
              rows={4}
              schema={pollSchema}
            />
          </div>
        </SectionContent>
      </SectionCard>

      {/* Calendar Section - Separate Box */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={<Calendar className="h-5 w-5" />}
          title="Calendar"
          description="Select potential dates or times for your event"
        />
        <SectionContent>
          {errors.selectedDates && (
            <p className="mb-4 text-sm text-red-500">
              {errors.selectedDates.message}
            </p>
          )}

          {/* Two-column layout: Calendar + Selected Dates */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Calendar - Fixed width */}
            <div className="space-y-4 lg:col-span-1">
              <div className="w-fit">
                <Controller
                  name="selectedDates"
                  control={control}
                  render={({ field }) => (
                    <CalendarComponent
                      mode="multiple"
                      selected={field.value}
                      onSelect={(dates) => field.onChange(dates ?? [])}
                      className="rounded-md border-primary"
                    />
                  )}
                />
              </div>

              {/* Today Button */}
              <div className="flex justify-start">
                <Controller
                  name="selectedDates"
                  control={control}
                  render={({ field }) => (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const today = new Date();
                        if (
                          !field.value.some(
                            (date) =>
                              date.toDateString() === today.toDateString(),
                          )
                        ) {
                          field.onChange([...field.value, today]);
                        }
                      }}
                      className="px-6 text-sm shadow-card hover:shadow-card-hover transition-all"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Today
                    </Button>
                  )}
                />
              </div>
            </div>

            {/* Right Column: Selected Dates - Scalable */}
            <div className="space-y-4 lg:col-span-2">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Selected Dates</h3>

                {selectedDates && selectedDates.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {selectedDates
                      .sort((a, b) => a.getTime() - b.getTime())
                      .map((date, index) => (
                        <Controller
                          key={index}
                          name="selectedDates"
                          control={control}
                          render={({ field }) => (
                            <div
                              className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-primary p-3 shadow-card hover:shadow-card-hover bg-white transition-all hover:scale-105"
                              onClick={() => {
                                field.onChange(
                                  field.value.filter((_, i) => i !== index),
                                );
                              }}
                            >
                              <div className="text-center text-xs font-medium tracking-wide uppercase text-purple-600 group-hover:text-purple-700">
                                {date
                                  .toLocaleDateString("en-US", {
                                    month: "short",
                                  })
                                  .toUpperCase()}
                              </div>
                              <div className="text-xl leading-none font-bold text-purple-800 group-hover:text-purple-900">
                                {date.getDate()}
                              </div>
                              <div className="text-xs font-medium text-purple-600 group-hover:text-purple-700">
                                {date
                                  .toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })
                                  .toUpperCase()}
                              </div>
                            </div>
                          )}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 rounded-lg bg-purple-50 border-2 border-dashed border-purple-300">
                    <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-purple-600 font-medium">
                      No dates selected
                    </p>
                    <p className="text-xs text-purple-500 mt-1">
                      Choose dates in the calendar to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionContent>
      </SectionCard>

      {/* Action Buttons */}
      <div className={`pt-4 sm:pt-6 ${hideMobileSubmit ? "hidden sm:block" : ""}`}>
        {onCancel ? (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>

            <LoadingButton
              type="submit"
              loading={isLoading}
              loadingText="Saving..."
              className="flex-1"
            >
              <Users className="mr-2 h-5 w-5" />
              {submitText}
            </LoadingButton>


          </div>
        ) : (
          <LoadingButton
            type="submit"
            loading={isLoading}
            loadingText="Creating your poll..."
            className="w-full"
          >
            <Users className="mr-2 h-5 w-5" />
            {submitText}
          </LoadingButton>
        )}
      </div>
    </form>
  );
}