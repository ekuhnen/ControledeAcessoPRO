import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface ZKUser {
  pin: string;
  name: string;
  privilege: number; // 0 for user, 10 for manager/admin
  password?: string;
  card?: string;
  groupId?: string;
}

export const deviceService = {
  async queueCommand(deviceId: string, type: string, payload: string) {
    return await addDoc(collection(db, "commands"), {
      deviceId,
      type,
      payload,
      status: "PENDING",
      createdAt: Timestamp.now(),
    });
  },

  // DATA UPDATE user: PIN, Name, Pri, Password, Card, Group
  async updateUser(deviceId: string, user: ZKUser) {
    const payload = `DATA UPDATE user PIN=${user.pin}\tName=${user.name}\tPri=${user.privilege}\tPass=${user.password || ""}\tCard=${user.card || ""}\tGrp=${user.groupId || "1"}`;
    return this.queueCommand(deviceId, "user_update", payload);
  },

  // DATA UPDATE userauthorize: PIN, AuthorizeTimezone, AuthorizeDoor
  async authorizeUser(deviceId: string, pin: string, timezone: string = "1", door: string = "1") {
    const payload = `DATA UPDATE userauthorize PIN=${pin}\tAuthorizeTimezone=${timezone}\tAuthorizeDoor=${door}`;
    return this.queueCommand(deviceId, "user_authorize", payload);
  },

  // DATA UPDATE biophoto: PIN, Type (9 for visible light face), Size, Content (Base64)
  async updateFace(deviceId: string, pin: string, photoBase64: string) {
    // Type 9 is indeed for visible light facial photo in modern ZKTeco push devices
    const payload = `DATA UPDATE biophoto PIN=${pin}\tType=9\tSize=${photoBase64.length}\tContent=${photoBase64}`;
    return this.queueCommand(deviceId, "biophoto_update", payload);
  },

  async openDoor(deviceId: string) {
    const payload = `CONTROL DEVICE Operation=1`; // Operation 1 is usually Unlock
    return this.queueCommand(deviceId, "control_unlock", payload);
  },

  async reboot(deviceId: string) {
    const payload = `CONTROL DEVICE Operation=0`; // Operation 0 is usually Reboot
    return this.queueCommand(deviceId, "control_reboot", payload);
  }
};
