import logo from "@/assets/kaif-logo-3d.png";

type Props = {
  className?: string;
};

export function Logo3D({ className = "" }: Props) {
  return (
    <div className={className}>
      <img
        src={logo}
        alt="KAIF Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
