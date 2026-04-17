import DriverControlIcon from "@/components/branding/DriverControlIcon";
import DriverControlLogo from "@/components/branding/DriverControlLogo";

export default function Index() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 space-y-8">
      <DriverControlIcon size={120} />
      <DriverControlLogo iconSize={80} />
      <DriverControlLogo iconSize={80} stacked />
    </div>
  );
}
