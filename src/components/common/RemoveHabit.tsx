import { Button } from '@/components/ui/button'
import { type ReactNode, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Habit } from '../../../types'

export const RemoveHabit = ({
  habit,
  trigger
}: {
  habit: Habit
  trigger: ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const deleteHabitById = useMutation(api.habits.deleteHabitById)

  function removeHabit() {
    try {
      deleteHabitById({
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
            <DialogTitle>Remove habit</DialogTitle>
            <DialogDescription className='pt-2 pb-6'>
              Are you sure you want to delete this habit?
            </DialogDescription>
            <div className='flex gap-2'>
              <Button variant='secondary' onClick={() => setIsOpen(false)}>
                Back
              </Button>
              <Button onClick={removeHabit}>Confirm</Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
