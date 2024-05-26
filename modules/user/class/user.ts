import Groups from "../../../config/groups.json";
import logger from "../../logger/class/logger";
import Database from "../../database";
import { SQLSafe, SQLUpdateInsert, GetTime } from "../../utils";
import Group from "./group";
import jwt from "../../jwt";
import Discord from "../../discord/discord";

const database = new Database();

if (!Groups.groups)
    logger.Error("Группы не настроенны!");

interface UserObject {
    id: number,
    email: string,
    username: string,
    password: string,
    rank: string,
    blocked: boolean,
    group: Group;
}

let groups = {};

// создание групп как объектов
for (let groupName in Groups.groups) {
    let groupData = Groups.groups[groupName];

    let group = new Group(groupName);

    group.NiceName = groupData.niceName;
    group.DiscordID = groupData.discordID;
    group.Flags = groupData.flags;

    groups[groupName] = group;
}

export default class User {
    user: UserObject;

    constructor(user: UserObject) {
        this.user = user;
        this.user.group = groups[this.user.rank];
    }

    // password

    get Password() {
        return this.user.password;
    }

    // username

    get Username() {
        return this.user.username;
    }

    get ID() {
        return this.user.id;
    }

    // block (ban)

    set Blocked(isBlocked: boolean) {
        this.user.blocked = isBlocked;
    }

    get Blocked() {
        return this.user.blocked == true;
    }

    // email

    get Email() {
        return this.user.email;
    }

    // rank

    set Rank(rank: string) {
        this.user.rank = rank;
    }

    get Rank() {
        return this.user.rank;
    }

    // group

    get Group() {
        return this.user.group;
    }

    // other

    Token(): string {
        return jwt.Get(this);
    }

    HWID(): string {
        let response = database.GetQuery(`SELECT * FROM hwids WHERE username=${SQLSafe(this.Username)}`);
        return response ? response.hwid : null;
    }

    SetHWID(hwid: string) {
        SQLUpdateInsert(database, "hwids", "username", this.Username, "hwid", hwid);
    }

    SetGroup(group: string) {
        database.RunQuery(`UPDATE users SET rank=${SQLSafe(group)} WHERE username=${SQLSafe(this.Username)}`);
    }

    GetGroupName(): string {
        return this.Group.NiceName;
    }

    GetGroupExpire(): number {
        return Group.Expire(this);
    }

    GetPurchases() {
        return database.EveryQuery(`SELECT * FROM purchases WHERE userID=${SQLSafe(this.ID)}`);
    }

    RemoveItem(purchaseID: number) {
        database.RunQuery(`DELETE FROM purchases WHERE id=${purchaseID};`);
    }

    HasItem(itemID: string): boolean {
        let purchases = this.GetPurchases();

        let res = false;
        let current_time = GetTime();

        for (let item in purchases) {
            let purchase = purchases[item];

            let expire = purchase.itemExpire;
            if (purchase.itemID == itemID) {
                if (expire != 0 && current_time > expire) {
                    this.RemoveItem(purchase.id);
                    Discord.UpdateUser(this);
                    break;
                }

                res = true;
                break;
            }
        }

        return res;
    }

    HasFlag(flag: string): boolean {
        let flags = this.Group.Flags;
        return flags === "*" || flags.includes(flag);
    }

    EraseHWID() {
        database.RunQuery(`UPDATE hwids SET hwid=null WHERE username=${SQLSafe(this.Username)}`);
    }
}