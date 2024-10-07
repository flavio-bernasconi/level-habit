"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TrashIcon } from "@radix-ui/react-icons";
import { api } from "../../convex/_generated/api";
import { HabitByDate } from "../../types";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { CreateNewHabit } from "@/components/common/CreateNewHabit";
import useStoreUserEffect from "@/hooks/useStoreUser";

const today = new Date().toLocaleDateString("en-us", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export default function Home() {
  useStoreUserEffect();

  const habits = useQuery(api.habits.get);
  const levels = useQuery(api.levels.get);
  const totalCounter = useQuery(api.habitsByDate.getTotalCounter);
  const todayCounter = useQuery(api.habitsByDate.getTodayCounter, {
    date: today,
  });
  const habitByDate = useQuery(api.habitsByDate.get, {
    date: today,
  });

  const editDateHabit = useMutation(api.habitsByDate.createOrUpdateHabitByDate);

  const orderByHabitId:
    | {
        [id: Id<"habits">]: HabitByDate;
      }
    | undefined = habitByDate?.reduce(
    (acc, h) => {
      acc[h.habitId as Id<"habits">] = {
        ...h,
      };
      return acc;
    },
    {} as { [id: Id<"habits">]: HabitByDate }
  );

  return (
    <div className="flex flex-col gap-4 h-screen p-4 mx-auto max-w-3xl relative">
      <div className="w-full">
        <p className="text-xl">Total: {totalCounter}</p>
        <Progress value={totalCounter} />
        <p className="mt-2">today total:{todayCounter}</p>
      </div>
      <CreateNewHabit />
      {habits?.map((habit) => {
        const savedLevel = orderByHabitId?.[habit._id]?.activeLevel;
        return (
          <div key={habit._id} className="shadow-lg p-4 rounded-lg bg-gray-200">
            <h1 className="text-xl font-bold">{habit.name}</h1>
            <p>
              {savedLevel
                ? habit.levelsDescription[savedLevel]
                : "select one level"}
            </p>
            <div className="flex gap-4 my-4 justify-between">
              <div className="flex gap-4">
                {levels?.map((level) => (
                  <Button
                    className={cn(
                      !savedLevel ? "bg-slate-800" : "bg-slate-400",
                      savedLevel === level.id
                        ? "bg-slate-800 hover:bg-slate-900"
                        : "",
                      "relative"
                    )}
                    key={level.id}
                    onClick={() => {
                      editDateHabit({
                        date: today,
                        habitId: habit._id,
                        activeLevel: level.id,
                        value: level.value,
                      });
                    }}
                  >
                    {savedLevel === level.id && (
                      <p className="absolute h-6 w-6 -top-3 -right-3 bg-blue-200 text-slate-700 rounded-full font-semibold text-[10px] grid place-content-center m-0 p-1 border border-blue-400">
                        +{level.value}
                      </p>
                    )}
                    {level.label}
                  </Button>
                ))}
              </div>
              <Button
                size="icon"
                disabled={!savedLevel}
                onClick={() => {
                  editDateHabit({
                    date: today,
                    habitId: habit._id,
                    activeLevel: undefined,
                  });
                }}
              >
                <TrashIcon />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
