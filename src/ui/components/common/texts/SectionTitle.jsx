export default function SectionTitle({ position,children }) {
  return (
    <div className={` mb-6 ${position} `}>
      <h2 className={"text-3xl font-extrabold text-gray-700 mb-1"}>{children}</h2>
      <p className="text-[#228E8D] text-lg opacity-70">___________</p>
    </div>
  )
}