import Image from "next/image";

export const ChannelIcon = ({ channel }: { channel: string }) => {
    const iconMap: Record<string, string> = {
        wxwork: "/wxwork.svg",
        feishu: "/feishu.svg",
        serverchan: "/serverchan.png",
        none: "/mute.svg",
    };
    const src = iconMap[channel];
    if (!src) return null;
    return (
        <Image
            src={src}
            alt={channel}
            width={20} // w-5 = 20px
            height={20} // h-5 = 20px
            className="mr-2"
        />
    );
};

export const InlineChannelIcon = ({ channel }: { channel: string }) => {
    return (
        <div className="h-4 w-4 inline-block vertical-align: middle; mr-1">
            <ChannelIcon channel={channel} />
        </div>
    );
};
