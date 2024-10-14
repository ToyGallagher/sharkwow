import React from 'react'
import UpdateEditor from 'src/components/account/updateproject/editor'
type Props = {}

export default function page({ params }: { params: { ProjectId: string } }) {
  return (
    <section>
        <UpdateEditor projectId={params.ProjectId}/>
    </section>
  )
}