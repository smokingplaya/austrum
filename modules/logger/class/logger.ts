import colors from "colors";
import { FormatTime } from "../../utils";

export default class logger {
    private static GetTimeStamp(): string {
        let time = FormatTime();

        return `[${time.hours}:${time.minutes}:${time.seconds}]`;
    }

    static Info(message: string): void {
        console.log(`${logger.GetTimeStamp()} ${colors.blue("[INFO]")} ${message}`);
    }

    static Warning(message: string): void {
        console.log(`${logger.GetTimeStamp()} ${colors.yellow("[WARNING]")} ${message}`);
    }

    static Error(message: string): void {
        console.log(`${logger.GetTimeStamp()} ${colors.red("[WARNING]")} ${message}`);
    }
}