import React, { useEffect } from 'react'
import { Button } from './ui/button'
import { useCreateCheckoutSessionMutation } from '@/features/api/purchaseApi'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const BuyCourseButton = ({ courseId }) => {
  const [createCheckoutSession, { data, isLoading, isSuccess, isError, error }] = useCreateCheckoutSessionMutation()

  const purchaseCourseHandler = async () => {
    await createCheckoutSession(courseId)
  }

  useEffect(() => {
    if(isSuccess){
      if(data?.url){
        window.location.href = data.url 
      }
    }
    // else{
    //   toast.error("Error: Invalid Response from server")
    // }
    if(isError){
      toast.error(error.data?.message || "Failed to create checkout session")
    }
  },[data, isSuccess, isError, error])

  return (
    <Button className="w-full" onClick={purchaseCourseHandler} disabled={isLoading}>
      {
        isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animates-spin' />
            please Wait..
          </>
        ) : (
          "Purchase Course"
        )
      }
    </Button>
  )
}

export default BuyCourseButton