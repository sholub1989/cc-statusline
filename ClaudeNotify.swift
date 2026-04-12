import Foundation
import UserNotifications

let args = CommandLine.arguments

// Exit if launched without arguments (e.g. by clicking a notification)
guard args.count > 1 else { exit(0) }

let center = UNUserNotificationCenter.current()

// --dismiss <project>: remove delivered notification and exit
if args[1] == "--dismiss" {
    let project = args.count > 2 ? args[2] : ""
    center.removeDeliveredNotifications(withIdentifiers: ["claude-\(project)"])
    RunLoop.current.run(until: Date(timeIntervalSinceNow: 0.1))
    exit(0)
}

let title = args[1]
let body = args.count > 2 ? args[2] : ""
let withSound = args.contains("--sound")
let id = "claude-\(body)"
let sem = DispatchSemaphore(value: 0)

center.requestAuthorization(options: [.alert, .sound]) { granted, _ in
    guard granted else {
        fputs("denied\n", stderr)
        sem.signal()
        return
    }
    let c = UNMutableNotificationContent()
    c.title = title
    if !body.isEmpty { c.body = body }
    if withSound { c.sound = .default }
    center.add(UNNotificationRequest(identifier: id, content: c, trigger: nil)) { _ in
        sem.signal()
    }
}

_ = sem.wait(timeout: .now() + 2)
