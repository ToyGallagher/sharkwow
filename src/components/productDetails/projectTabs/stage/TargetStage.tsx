import React, { useState } from "react";

import { useRouter } from "next/navigation";

import { useProjectDetails } from "src/context/useProjectDetails";

import { StripePaymentMethod } from "src/constants/paymentMethod";
import { checkout } from "src/services/apiService/payments/checkout";

import { Stage } from "src/interfaces/models/project";
import { StageStatus, TransactionType } from "src/interfaces/models/enums";
import { CheckoutPayload } from "src/interfaces/payload/paymentPayload";

import Image from "next/image";
import { useUserData } from "src/context/useUserData";
import { message } from "antd";

type Props = {
    stage: Stage;
};

function formatOwnerShip(goalStageFunding: number, goalProjectFunding: number) {
    return (goalStageFunding / goalProjectFunding) * 100;
}

function formatEstimatedDate(endDate: string): string {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
        return "The date has already passed.";
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days} days, ${hours} hours`;
}
export default function TargetStage({ stage }: Props) {
    // test
    const { ProjectInfo } = useProjectDetails();
    const { user } = useUserData();
    const router = useRouter();
    const [supportLoading, setSupportLoading] = useState<boolean>(false);

    const handleCheckout = async () => {
        if (!user) {
            router.push("/sign-in");
            return;
        }

        if (user?.uid !== ProjectInfo.uid) {
            setSupportLoading(true);
            try {
                const payload: CheckoutPayload = {
                    projectId: ProjectInfo.projectId ?? "",
                    projectName: ProjectInfo.name ?? "",
                    fundingCost: Number(stage.fundingCost.toFixed(0)),
                    paymentMethod: StripePaymentMethod.Card,
                    stageId: stage.stageId,
                    stageName: ProjectInfo.name ?? "",
                    transactionType: TransactionType.FUNDING,
                };

                const response = await checkout(payload);

                if (response.status === 201) {
                    router.push(response.redirectUrl);
                }
            } catch (error: unknown) {
                message.error("Something went wrong - try again!");
            } finally {
                setSupportLoading(false);
            }
        } else {
            message.error("You are owner of this project");
        }
    };

    return (
        <li
            key={stage.stageId}
            className="flex h-fit cursor-pointer flex-col rounded-lg border border-orange-200 transition-all duration-700 hover:bg-orange-100"
        >
            <div>
                {ProjectInfo.carouselImageUrls?.[0] !== undefined && (
                    <Image
                        src={ProjectInfo.carouselImageUrls?.[0]}
                        alt=""
                        width={500}
                        height={400}
                        className="w-full cursor-pointer rounded-t-lg"
                        draggable={false}
                    />
                )}
            </div>
            <div className="flex flex-col px-[2vw] py-[2vh]">
                <div>
                    <div className="flex flex-row justify-between gap-x-[2vw]">
                        <h3 className="text-lg font-semibold text-gray-700">{ProjectInfo.name}</h3>
                        <h3 className="flex flex-row text-lg font-normal text-gray-600">
                            {stage.fundingCost.toLocaleString()} THB
                        </h3>
                    </div>
                </div>
                <div className="flex w-full flex-col pt-[1vh]">
                    <div
                        className="ql-editor preview-content !p-0 text-sm"
                        dangerouslySetInnerHTML={{
                            __html: stage.detail || "",
                        }}
                    />
                </div>
                <div className="flex flex-wrap justify-center gap-y-[2vh] pt-[1vh]">
                    <span className="flex w-1/2 flex-col items-center">
                        <p className="text-lg font-bold text-gray-700">Current Funding</p>
                        <p className="pl-[1vw] text-base text-gray-600">
                            {stage.currentFunding.toLocaleString()} THB
                        </p>
                    </span>
                    <span className="flex w-1/2 flex-col items-center">
                        <p className="text-lg font-bold text-gray-700">Goal Funding</p>
                        <p className="pl-[1vw] text-base text-gray-600">
                            {stage.goalFunding.toLocaleString()} THB
                        </p>
                    </span>
                    <span className="flex w-1/2 flex-col items-center">
                        <p className="text-lg font-bold text-gray-700">Ownership</p>
                        <p className="pl-[1vw] text-base text-gray-600">
                            {formatOwnerShip(
                                stage.goalFunding,
                                (ProjectInfo.totalQuantity ?? 0) *
                                    (ProjectInfo.costPerQuantity ?? 0)
                            ).toFixed()}{" "}
                            %{" "}
                        </p>
                    </span>
                </div>
                <div>
                    <div className="my-[1.5vh] flex w-full flex-row items-center justify-between gap-y-[1vh]">
                        <p className="text-lg font-bold text-gray-700">Stage</p>
                        <p className="text-base text-gray-600">{stage.name}</p>
                    </div>
                    <div className="my-[1.5vh] flex w-full flex-row items-center justify-between gap-y-[1vh]">
                        <p className="text-lg font-bold text-gray-700">Backers</p>
                        <p className="text-base text-gray-600">
                            {stage.totalSupporter} / {ProjectInfo.totalQuantity}
                        </p>
                    </div>
                </div>
                <div className="flex w-full flex-row items-center justify-between gap-y-[1vh] pb-[2vh]">
                    <p className="text-lg font-bold text-gray-700">Estimated Date</p>
                    <p className="text-base text-gray-600">
                        {formatEstimatedDate(stage.expireDate)}
                    </p>
                </div>
                <div className="flex w-full items-center justify-center">
                    <button
                        onClick={async () => {
                            if (!user) {
                                router.push("/sign-in");
                                return;
                            }
                            handleCheckout();
                        }}
                        disabled={
                            stage.status !== StageStatus.CURRENT ||
                            stage.totalSupporter == ProjectInfo.totalQuantity
                                ? true
                                : false
                        }
                        className={`w-full rounded-xl py-[1.5vh] shadow-md transition-all duration-700 hover:shadow-lg ${stage.status !== StageStatus.CURRENT || stage.totalSupporter == ProjectInfo.totalQuantity ? "cursor-not-allowed bg-orange-200 text-gray-500" : "cursor-pointer bg-orange-300 text-gray-600 hover:scale-[1.02] hover:bg-orange-400"} `}
                    >
                        <p className="text-base font-bold">
                            {(() => {
                                switch (stage.status) {
                                    case StageStatus.CURRENT:
                                        return stage.totalSupporter == ProjectInfo.totalQuantity
                                            ? "FULLY FUNDING"
                                            : "SUPPORT";
                                    case StageStatus.FINISH:
                                        return "LAUNCHED";
                                    case StageStatus.INCOMING:
                                        return "INCOMING";
                                    default:
                                        return "DEFAULT";
                                }
                            })()}
                        </p>
                    </button>
                </div>
            </div>
        </li>
    );
}
