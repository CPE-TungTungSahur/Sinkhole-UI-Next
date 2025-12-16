import { RiskColor } from "@/enums/RiskColor";

export const riskBreakPoint = {
    medium: 0.27,
    high: 0.3,
};

export function getRiskColor(prob: number): RiskColor {
    if (prob > riskBreakPoint.high) return RiskColor.High; // High
    if (prob > riskBreakPoint.medium) return RiskColor.Medium; // Medium
    return RiskColor.Low; // low
}
