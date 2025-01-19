import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React from 'react'

const verifyAccount=()=> {
 const router = useRouter()
 const param = useParams<(username: string)>() 
 const {toast} = userToast
 
  return (
    <div>verifyAccount</div>
  )
}

export default verifyAccount