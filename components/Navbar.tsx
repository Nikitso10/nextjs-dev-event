import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    return (
        <header>
            <nav>
                <Link href="/" className="logo">
                    <Image src="/icons/logo.png" width={24} height={24} alt="logo" />
                    <p>DevEvent</p>
                </Link>

                <ul className="nav">
                    <Link href="/" className="nav-item">Home</Link>
                    <Link href="/explore" className="nav-item">Events</Link>
                    <Link href="/" className="nav-item">Create Event</Link>
                </ul>
            </nav>
        </header>
    )
}
export default Navbar
