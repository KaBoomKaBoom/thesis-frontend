import { TeacherStudentDetailContent } from "@/components/teacher/student-detail-content"

export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  return <TeacherStudentDetailContent studentId={studentId} />
}
