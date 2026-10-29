export default function SubjectHeader({ title }) {
  return (
    <h2 className="text-main-600 text-center w-full border-main-400 
                    text-lg mt-sm
                    min-[769px]:text-h1 min-[769px]:mt-md border-y-2">
      {title}
    </h2>
  );
}