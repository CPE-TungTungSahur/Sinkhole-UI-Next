"use client";

import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import mockMember from "../../../assets/member.png";
import nonFace from "../../../assets/members/non.png";
import boomFace from "../../../assets/members/boom.png";
import subFace from "../../../assets/members/sub.png";
import minFace from "../../../assets/members/min.png";
import Footer from "@/components/Footer";

interface IMember {
    profile: StaticImageData;
    prefix: string;
    firstname: string;
    lastname: string;
    id: string;
    role: string;
}

const members: IMember[] = [
    {
        profile: subFace,
        prefix: "Mr.",
        firstname: "Thanachot",
        lastname: "Thetkan",
        id: "68070501017",
        role: "Machine Learning",
    },
    {
        profile: minFace,
        prefix: "Mr.",
        firstname: "Kwanpapha",
        lastname: "Kosaiyaporn",
        id: "68070501006",
        role: "Machine Learning",
    },
    {
        profile: boomFace,
        prefix: "Mr.",
        firstname: "Patipol",
        lastname: "Pongsawat",
        id: "68070501029",
        role: "Web Backend",
    },
    {
        profile: nonFace,
        prefix: "Mr.",
        firstname: "Kanakorn",
        lastname: "Thaiprakhon",
        id: "68070501007",
        role: "Web Frontend",
    },
];

export default function Members(): React.JSX.Element {
    const [shadowColors, setShadowColors] = useState<string[]>(members.map(() => "#06b6d4"));

    useEffect(() => {
        const colors = ["#f97414", "#06b6d4", "#ef4443"];

        const interval = setInterval(() => {
            setShadowColors(members.map(() => colors[Math.floor(Math.random() * colors.length)]));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="min-h-screen w-full bg-gradient-to-br from-[#2e344b] via-[#2e344b]/80 to-[#2e344b] pb-16 pt-36">
                <div className="container mx-auto">
                    <div className="mx-5 rounded-3xl border-2 border-cyan-400 px-10 pb-16 shadow-[0_0_10px_#06b6d4]">
                        <div className="mx-auto mb-10 mt-[-2px] w-fit rounded-b-3xl border-2 border-cyan-400 px-5 pb-5 pt-5 text-2xl font-bold text-white shadow-[0_0_50px_#06b6d4]">Team Members</div>
                        <div className="grid grid-cols-1 justify-items-center gap-y-16 md:gap-y-36 lg:grid-cols-2 lg:justify-items-start">
                            {members.map((m: IMember, i: number) => (
                                <div key={i} className="col-span-1 mx-auto flex flex-col items-center gap-10 md:flex-row md:items-start">
                                    <div className="animate__animated animate__fadeIn animate__fast relative w-40">
                                        <Image
                                            src={m.profile}
                                            className="h-40 w-40 rounded-full border-2 transition-all duration-300"
                                            style={{
                                                boxShadow: `0 0 20px ${shadowColors[i]}`,
                                                borderColor: shadowColors[i],
                                            }}
                                            alt="member1"
                                        />
                                    </div>
                                    <div className="my-auto hidden h-40 w-1 rounded-xl bg-white md:flex"></div>
                                    <div className="mt-1 flex animate-slideLeftIn flex-col font-bold text-white duration-700 md:mt-10">
                                        <div className="text-white">
                                            Name :{" "}
                                            <span className="text-lg text-cyan-400">
                                                {m.prefix}
                                                {m.firstname} {m.lastname}
                                            </span>
                                        </div>
                                        <div className="text-white">
                                            ID : <span className="text-lg text-cyan-400">{m.id}</span>
                                        </div>
                                        <div className="text-white">
                                            Role : <span className="text-lg text-cyan-400">{m.role}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}
