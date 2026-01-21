"use client";

import { FC } from "react";
import { useForm, Controller } from "react-hook-form";
import { FileUpload } from "./FileUpload";
import { Button } from "./ui/button";

type FormData = {
  brandName: string;
  description: string;
  files: FileList;
};

type Props = {
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
};

export const ComplaintForm: FC<Props> = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, control } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          Brand Name
        </label>
        <input
          {...register("brandName", { required: true })}
          className="border rounded p-2 w-full bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          Description
        </label>
        <textarea
          {...register("description", { required: true })}
          className="border rounded p-2 w-full h-32 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          Upload Receipt/Image/PDF
        </label>
        <Controller
          control={control}
          name="files"
          render={({ field }) => <FileUpload onChange={field.onChange} />}
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary text-white p-2 rounded"
      >
        {isSubmitting ? "Submitting..." : "Submit Complaint"}
      </Button>
    </form>
  );
};

export default ComplaintForm;
