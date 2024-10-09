import { Button } from '@/components/ui/button'
import type React from 'react'
import { type ReactNode, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Habit } from '../../../types'

export const EditHabit = ({
  habit,
  trigger
}: {
  habit: Habit
  trigger: ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const levels = useQuery(api.levels.get)
  const mutation = useMutation(api.habits.editHabit)

  function createHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const formDataObj = Object.fromEntries(formData.entries())

    try {
      mutation({
        name: formDataObj.name as string,
        levelsDescription: {
          show: formData.get('show') as string,
          easy: formData.get('easy') as string,
          medium: formData.get('medium') as string,
          hard: formData.get('hard') as string
        },
        id: habit._id
      })
      setIsOpen(false)
    } catch (error) {
      console.error({ error })
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className='w-full text-left'>
          {trigger ?? 'edit'}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit habit</DialogTitle>
            <DialogDescription className='sr-only'></DialogDescription>
            <form onSubmit={createHabit}>
              <div className='flex flex-col gap-4 mb-4'>
                <div>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    required
                    id='name'
                    name='name'
                    defaultValue={habit.name}
                  />
                </div>
                <hr className='my-3' />
                <p className='text-sm '>Levels settings:</p>
                {levels?.map(level => (
                  <div key={level._id}>
                    <Label
                      htmlFor={level._id}
                      className='flex items-center gap-1 mb-1'
                    >
                      {level.label}
                      <span className='text-xs text-slate-400'>
                        (+{level.value})
                      </span>
                    </Label>
                    <Input
                      required
                      id={level._id}
                      name={level.id}
                      defaultValue={habit.levelsDescription[level.id]}
                      placeholder='Describe action for this level'
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
  )
}
