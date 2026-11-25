import type { SVGProps } from 'react';

type PixelProps = SVGProps<SVGSVGElement> & { name: string };
const icons: Record<string, string> = {
  sound: 'M2 6h3V5h2V3h2v10H7v-2H5v-1H2z M11 5h1v2h-1z M12 7h1v2h-1z M11 9h1v2h-1z M14 3h1v3h-1z M15 6h1v4h-1z M14 10h1v3h-1z',
  mute: 'M2 6h3V5h2V3h2v10H7v-2H5v-1H2z M11 5h1v1h-1z M12 6h1v1h-1z M13 7h1v2h-1z M14 9h1v1h-1z M15 10h1v1h-1z M15 5h1v1h-1z M14 6h1v1h-1z M12 9h1v1h-1z M11 10h1v1h-1z',
  play: 'M4 2h2v2h3v2h3v2h3v1h-3v2H9v2H6v2H4z',
  players: 'M3 2h5v5H3z M10 3h4v4h-4z M2 9h7v2h1v3H1v-3h1z M11 9h3v1h1v4h-4z',
  target: 'M4 1h8v2h2v2h1v6h-1v2h-2v2H4v-2H2v-2H1V5h1V3h2z M5 3v2H3v6h2v2h6v-2h2V5h-2V3z M6 6h4v4H6z',
  bolt: 'M8 1h5l-3 5h4L6 15l1-6H3z',
  flame: 'M8 1h2v4h2v3h2v5h-2v2H4v-2H2V8h2V6h2V4h2z M7 9v2H6v2h4v-2H9V9z',
  flask: 'M5 1h6v2h-1v4h1v2h1v2h2v3h-1v1H3v-1H2v-3h2V9h1V7h1V3H5z M7 3v5H6v2h4V8H9V3z M5 12v1h2v-1z M9 11v1h2v-1z',
  lock: 'M5 2h6v1h1v4h2v7H2V7h2V3h1z M6 4v3h4V4z M7 9v3h2V9z',
  copy: 'M2 1h9v2H4v8H2z M6 5h8v10H6z M8 7v6h4V7z',
  back: 'M7 2h2v2H7v2H5v1h10v2H5v1h2v2h2v2H7v-2H5v-2H3V9H1V7h2V6h2V4h2z',
  clock: 'M4 1h8v2h2v2h1v6h-1v2h-2v2H4v-2H2v-2H1V5h1V3h2z M5 3v2H3v6h2v2h6v-2h2V5h-2V3z M7 4h2v4h3v2H7z',
  bomb: 'M6 3h4v1h2V3h1V1h2v2h-1v2h-2v2h2v2h1v4h-2v2H3v-2H1V8h1V6h2V5h2z M4 7v2H3v2h2V9h2V7z',
  crown: 'M1 4h2v2h2v2h2V4h1V2h1v2h1v4h2V6h2V4h1v7h-1v3H2v-3H1z'
};
export function Pixel({ name, ...props }: PixelProps) {
  return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true" {...props}>
    <path d={icons[name]} fillRule="evenodd" />
  </svg>;
}

export function Mascot() {
  return <svg className="mascot" viewBox="0 0 256 218" shapeRendering="crispEdges" role="img" aria-label="A cartoon pixel bomb with a burning fuse">
    <path fill="#17181b" d="M74 191h111v6h-8v6H81v-6h-7z" />
    <path fill="#838590" d="M113 61h31v9h12v12h21v10h12v14h9v17h6v42h-8v16h-13v12h-15v8H89v-8H72v-12H60v-16h-8v-41h6v-18h10V93h13V83h21V71h11z" />
    <path fill="#121317" d="M116 66h24v10h11v12h23v10h11v13h8v17h6v33h-8v16h-12v11h-15v8H94v-8H76v-11H65v-16h-8v-33h6v-17h10V98h12V88h21V76h10z" />
    <path fill="#41434d" d="M111 75h36v14h-36z M88 94h81v7h12v12h8v17h6v29h-8v15h-13v11h-13v7H96v-7H80v-11H69v-15h-8v-29h6v-17h10v-12h11z" />
    <path fill="#535560" d="M107 96h50v9h17v10h8v17h7v12h-8v17h-9v12h-17v9h-47v-6H86v-12H75v-16h-9v-14h7v-16h11v-13h23z" />
    <path fill="#24252c" d="M188 131h7v29h-8v15h-13v11h-13v6H96v-7H80v-11H69v-15h12v10h16v8h58v-7h17v-11h8v-14h8z" />
    <path fill="#9799a4" d="M87 109h30v8h-12v7H94v11H79v-12h8z M72 138h11v12H72z" />
    <path fill="#bdbec5" d="M89 110h21v6H99v7H89z" />
    <path fill="#0c0d10" d="M95 139h20v23H95z M143 139h20v23h-20z M114 165h30v8h-7v6h-16v-6h-7z" />
    <path fill="#fff1cf" d="M98 141h11v12H98z M146 141h11v12h-11z" />
    <path fill="#f9895c" d="M83 164h13v7H83z M163 164h13v7h-13z" />
    <path fill="#a08247" d="M123 78V58h9V48h12v-9h16v-9h15v-9h13v11h-9v10h-16v9h-14v9h-8v17z" />
    <path fill="#ebc46e" d="M126 72V58h9V48h13v-8h15v-9h14v-9h7v7h-7v10h-16v9h-13v9h-8v15z" />
    <g className="fuse">
      <path fill="#f77642" d="M194 3h7v11h12V8h7v13h12v8h-11v8h-8v10h-8V36h-10v7h-7V31h-10v-9h12v-8h4z" />
      <path fill="#ffd43d" d="M198 13h7v9h10v8h-10v8h-7v-8h-9v-8h9z" />
      <path fill="#fff6d9" d="M198 22h8v8h-8z" />
      <path fill="#ffd43d" d="M227 3h5v5h-5z M235 14h5v5h-5z M224 44h5v5h-5z M179 7h5v5h-5z" />
      <path fill="#f77642" d="M235 40h4v4h-4z M173 17h4v4h-4z" />
    </g>
  </svg>;
}

export const avatarNames = ['Ember', 'Volt', 'Mint', 'Nova', 'Cobalt', 'Coral', 'Plum', 'Slate'];
const avatarColors = ['#ff7755', '#ffd349', '#83cda4', '#c499ee', '#79b5f1', '#fa9ab8', '#dc805c', '#b2bfcb'];

export function Avatar({ index, className = '' }: { index: number; className?: string }) {
  return <svg className={'avatar ' + className} viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true">
    <rect width="24" height="24" fill="#17181c" />
    <path fill={avatarColors[index]} d={index % 2 === 0 ? 'M5 5h3V3h8v2h3v3h2v10h-3v3H6v-3H3V8h2z' : 'M4 4h4v2h8V4h4v7h2v6h-3v3h-3v2H8v-2H5v-3H2v-6h2z'} />
    <path fill="#28282e" d="M6 11h4v5H6z M14 11h4v5h-4z M10 17h4v2h-4z" />
    <path fill="#fff0d6" d="M6 11h2v2H6z M14 11h2v2h-2z" />
  </svg>;
}
