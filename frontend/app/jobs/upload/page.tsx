import UploadJobPdfForm
from "@/components/upload-job-pdf-form";

export default function
UploadJobPage() {

  return (
    <main className="p-8">

      <h1
        className="
          text-3xl
          font-bold
          mb-6
        "
      >
        Upload Job Description
      </h1>

      <UploadJobPdfForm />

    </main>
  );
}