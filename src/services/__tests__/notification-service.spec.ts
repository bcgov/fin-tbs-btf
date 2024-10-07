import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  INotification,
  NotificationService,
  NotificationSeverity,
} from "../notification-service";

describe("NotificationService", () => {
  const listener = vi.fn();

  beforeEach(() => {
    NotificationService.registerNotificationListener(listener);
  });
  afterEach(() => {
    NotificationService.unregisterNotificationListener(listener);
    vi.resetAllMocks();
  });

  describe("pushNotificationError", () => {
    it("causes a new error notification to be delivered to listener", async () => {
      const message = "this is an error";
      NotificationService.pushNotificationError(message);
      expect(listener).toBeCalledTimes(1);
      const notification: INotification = listener.mock.calls[0][0];
      expect(notification.message).toBe(message);
      expect(notification.severity).toBe(NotificationSeverity.ERROR);
    });
  });

  describe("pushNotificationWarning", () => {
    it("causes a new warning notification to be delivered to listener", async () => {
      const message = "this is a warning";
      NotificationService.pushNotificationWarning(message);
      expect(listener).toBeCalledTimes(1);
      const notification: INotification = listener.mock.calls[0][0];
      expect(notification.message).toBe(message);
      expect(notification.severity).toBe(NotificationSeverity.WARNING);
    });
  });

  describe("pushNotificationInfo", () => {
    it("causes a new info notification to be delivered to listener", async () => {
      const message = "this is an info notification";
      NotificationService.pushNotificationInfo(message);
      expect(listener).toBeCalledTimes(1);
      const notification: INotification = listener.mock.calls[0][0];
      expect(notification.message).toBe(message);
      expect(notification.severity).toBe(NotificationSeverity.INFO);
    });
  });

  describe("pushNotification", () => {
    describe("when called with an invalid notification type", () => {
      it("throws an error", async () => {
        expect(() => {
          NotificationService.pushNotification({
            message: "a message",
            severity: "invalid notification type" as any,
            timeoutMs: 5000,
          });
        }).toThrow(Error);
      });
    });
  });
});
