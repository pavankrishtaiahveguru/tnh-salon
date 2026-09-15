export default function BranchStats() {
  const stats = [
    {
      value: "100%",
      label: "Pristine, Hygienic Environment",
    },
    {
      value: "100%",
      label: "Quality and Vegan Products",
    },
    {
      value: "10+",
      label: "Years of Experience",
    },
  ];

  return (
    <section className="bg-[#F4F7F4]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center px-6 py-14 text-center sm:py-10 lg:py-10"
          >
            <span className="font-serif text-5xl font-normal leading-none text-[#173B38] sm:text-6xl">
              {stat.value}
            </span>

            <p className="mt-5 font-serif text-base leading-7 text-[#59635F] sm:text-lg">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
