import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";

const yearOptions = [
  { value: "2018-2019", text: "2018-2019" },
  { value: "2019-2020", text: "2019-2020" },
  { value: "2020-2021", text: "2020-2021" },
  { value: "2021-2022", text: "2021-2022" },
  { value: "2022-2023", text: "2022-2023" },
  { value: "2023-2024", text: "2023-2024" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex gap-2 h-full">
        <div className="w-1/3 h-full rounded-lg border border-gray-600 p-4">
          <div className="mb-2">
            <label htmlFor="year">Year:</label>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {yearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.text}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* <div className="mb-2">
            <label htmlFor="teams">Teams:</label>
            <MultiSelect id="teams" options={teamOptions} />
          </div> */}
          {/* <div className="mb-2">
            <label htmlFor="loadLimit">Load Limit:</label>
            <Slider id="loadLimit" />
          </div> */}
        </div>
        <div className="w-2/3 h-full rounded-lg border border-gray-600">
          map
        </div>
      </div>
    </div>
  );
}
