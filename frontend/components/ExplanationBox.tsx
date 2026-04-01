interface Props {
  explanation: string;
}

export default function ExplanationBox({ explanation }: Props) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
      <h2 className="mb-2 text-sm font-semibold text-blue-800">Why did the model decide this?</h2>
      <p className="text-sm leading-relaxed text-blue-900">{explanation}</p>
    </div>
  );
}
