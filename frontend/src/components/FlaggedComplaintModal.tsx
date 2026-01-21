"use client";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "./ui/button";

interface FlaggedComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export default function FlaggedComplaintModal({
  isOpen,
  onClose,
  reason = "Our AI has detected potential issues with this complaint submission.",
}: FlaggedComplaintModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                      warning
                    </span>
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold text-foreground"
                  >
                    Flagged for Review
                  </Dialog.Title>
                </div>

                <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                  {reason}
                </Dialog.Description>

                <div className="mt-4 p-4 rounded-xl bg-muted">
                  <p className="text-sm font-semibold mb-2">What this means:</p>
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Your complaint will undergo manual verification</li>
                    <li>You may be asked to provide additional information</li>
                    <li>This does not affect your ability to submit</li>
                  </ul>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <Button variant="outline" onClick={onClose}>
                    Review Details
                  </Button>
                  <Button onClick={onClose}>Understood</Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
