import { Button, buttonVariants } from "@/components/ui/button";
import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export const CreateNewHabit = () => {
  const [isOpen, setIsOpen] = useState(false);
  const levels = useQuery(api.levels.get);
  const mutation = useMutation(api.habits.createNewHabit);

  function createHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formDataObj = Object.fromEntries(formData.entries());

    try {
      mutation({
        name: formDataObj.name as string,
        levelsDescription: {
          show: formData.get("show") as string,
          easy: formData.get("easy") as string,
          medium: formData.get("medium") as string,
          hard: formData.get("hard") as string,
        },
      });
      setIsOpen(false);
    } catch (error) {
      console.error({ error });
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
          className={cn(
            buttonVariants()
            // "fixed bottom-5 transform left-1/2 -translate-x-1/2"
          )}
        >
          Create new habit
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new habit</DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
            <form
              onSubmit={createHabit}
              onChange={(e) => {
                console.log(e);
              }}
            >
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input required id="name" name="name" />
                </div>
                <hr className="my-3" />
                <p className="text-sm ">Levels settings:</p>
                {levels?.map((level) => (
                  <div key={level._id}>
                    <Label
                      htmlFor={level._id}
                      className="flex items-center gap-1 mb-1"
                    >
                      {level.label}
                      <span className="text-xs text-slate-400">
                        (+{level.value})
                      </span>
                    </Label>
                    <Input
                      required
                      id={level._id}
                      name={level.id}
                      placeholder="Describe action for this level"
                    />
                  </div>
                ))}
              </div>
              <Button>Save</Button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
