import UploadResumeForm from "@/components/upload-resume-form";

export default function UploadPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">
        Upload Resume
      </h1>

      <UploadResumeForm />
    </main>
  );
}