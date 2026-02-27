
import Image from "next/image";


export default function ProfileHeader({name,avatarUrl}: {
    name: string | null;
    avatarUrl: string | null;
}) {
    return (
        <div className="space-y-4">
            {avatarUrl ? (
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full ring-1 ring-black/5">
                    <Image
                    src={avatarUrl}
                    alt={`${name || "User"} avatar`}
                    width={96}
                    height={96}
                    className="h-24 w-24 object-cover"
                    priority/>
                </div>
            ) : null}
            <h1 className="text-2xl font-semibold">{name}</h1>
        </div>
    );
}