window.ltssmSections = {
  "detect": {
    "title": "Detect",
    "diagrams": {
      "spec": "diagrams/detect.svg"
    },
    "descriptions": {
      "spec": "Receiver detection flow based on Detect.Quiet and Detect.Active extracted from markdown source."
    },
    "transitions": {
      "spec": [
        {
          "from": "Detect.Quiet",
          "to": "Detect.Active",
          "condition": "Move after a 12 ms timeout or if Electrical Idle Exit is detected on any lane.",
          "contextTags": [
            "Detect",
            "Timeout",
            "ElectricalIdleExit",
            "Gen1",
            "Gen2",
            "Gen3",
            "Gen4",
            "Gen5",
            "Gen6",
            "8b/10b",
            "128b/130b",
            "1b/1b",
            "Flit",
            "Non-Flit"
          ]
        },
        {
          "from": "Detect.Active",
          "to": "Polling.Active",
          "condition": "Move if a Receiver is detected on all unconfigured lanes.",
          "contextTags": [
            "Detect",
            "ReceiverDetect",
            "Polling",
            "Gen1",
            "Gen2",
            "Gen3",
            "Gen4",
            "Gen5",
            "Gen6"
          ]
        },
        {
          "from": "Detect.Active",
          "to": "Polling.Active",
          "condition": "If partial detect occurs, repeat detect after 12 ms and move only if exactly the same lanes detect Receiver in both attempts.",
          "contextTags": [
            "Detect",
            "ReceiverDetect",
            "PartialLane",
            "Timeout",
            "Polling"
          ]
        },
        {
          "from": "Detect.Active",
          "to": "Detect.Quiet",
          "condition": "Move if no lane detects a Receiver, or if second detect attempt does not match the first attempt lane set.",
          "contextTags": [
            "Detect",
            "ReceiverDetectFailure",
            "Timeout"
          ]
        }
      ]
    }
  },
  "polling": {
    "title": "Polling",
    "diagrams": {
      "spec": "diagrams/polling.svg"
    },
    "descriptions": {
      "spec": "Polling.Active, Polling.Configuration, and Polling.Compliance transitions extracted from markdown source."
    },
    "transitions": {
      "spec": [
        {
          "from": "Polling.Active",
          "to": "Polling.Compliance",
          "condition": "Move immediately if Enter Compliance bit was set before entering Polling.Active.",
          "contextTags": [
            "Polling",
            "Compliance",
            "RegisterControl",
            "Immediate"
          ]
        },
        {
          "from": "Polling.Active",
          "to": "Polling.Configuration",
          "condition": "Move after transmitting at least 1024 TS1 Ordered Sets and receiving eight consecutive qualifying training sequences on all lanes that detected a Receiver during Detect.",
          "contextTags": [
            "Polling",
            "TS1",
            "TS2",
            "Consecutive8",
            "Training",
            "Configuration"
          ]
        },
        {
          "from": "Polling.Active",
          "to": "Polling.Configuration",
          "condition": "After 24 ms, move if any lane has received eight consecutive qualifying sequences, at least 1024 TS1 Ordered Sets were transmitted after receiving one TS1 or TS2 Ordered Set, and the implementation-defined lane set saw Electrical Idle Exit.",
          "contextTags": [
            "Polling",
            "Timeout24ms",
            "TS1",
            "Training",
            "ElectricalIdleExit",
            "Configuration"
          ]
        },
        {
          "from": "Polling.Active",
          "to": "Polling.Compliance",
          "condition": "After 24 ms, move if not all predetermined lanes saw Electrical Idle Exit, or if any lane received eight consecutive TS1 Ordered Sets with Compliance_Receive_Request asserted and Loopback_Request deasserted.",
          "contextTags": [
            "Polling",
            "Compliance",
            "Timeout24ms",
            "TS1",
            "ComplianceRequest"
          ]
        },
        {
          "from": "Polling.Active",
          "to": "Detect.Quiet",
          "condition": "Move to Detect path if neither Polling.Configuration nor Polling.Compliance exit conditions are met.",
          "contextTags": [
            "Polling",
            "Detect",
            "Fallback"
          ]
        },
        {
          "from": "Polling.Configuration",
          "to": "Configuration.Linkwidth.Start",
          "condition": "Move when 8 consecutive TS2 with Link and Lane = PAD are received on lanes that detected Receiver, and 16 TS2 are sent after first TS2 receive.",
          "contextTags": [
            "Polling",
            "Configuration",
            "TS2",
            "PAD",
            "Consecutive8",
            "Transmit16"
          ]
        },
        {
          "from": "Polling.Configuration",
          "to": "Detect.Quiet",
          "condition": "Move to Detect path after 48 ms timeout if Polling.Configuration exit criteria are not met.",
          "contextTags": [
            "Polling",
            "Detect",
            "Timeout48ms"
          ]
        },
        {
          "from": "Polling.Compliance",
          "to": "Polling.Active",
          "condition": "Move back after Enter Compliance is cleared or the Upstream Port receives EIOS on any lane, with the required 8 EIOS / Electrical Idle / 2.5 GT/s handling completed.",
          "contextTags": [
            "Polling",
            "Compliance",
            "EIOS",
            "ElectricalIdle",
            "RateChange",
            "RegisterControl"
          ]
        },
        {
          "from": "Polling.Compliance",
          "to": "Polling.Active",
          "condition": "In the table-sequence path, move when Electrical Idle Exit is detected on any lane that detected a Receiver during Detect.",
          "contextTags": [
            "Polling",
            "Compliance",
            "ElectricalIdleExit",
            "SequenceMode"
          ]
        },
        {
          "from": "Polling.Compliance",
          "to": "Detect.Quiet",
          "condition": "Move to Detect path when Enter Compliance bit is 0b and not set on entry.",
          "contextTags": [
            "Polling",
            "Compliance",
            "Detect",
            "RegisterControl"
          ]
        }
      ]
    }
  },
  "configuration": {
    "title": "Configuration",
    "diagrams": {
      "spec": "diagrams/configuration.svg"
    },
    "descriptions": {
      "spec": "Configuration.Linkwidth.Start/Accept, Lanenum.Wait/Accept, Complete, and Idle transitions extracted from markdown source."
    },
    "transitions": {
      "spec": [
        {
          "from": "Configuration.Linkwidth.Start",
          "to": "Configuration.Linkwidth.Accept",
          "condition": "Move when qualifying lanes receive two consecutive TS1 with non-PAD Link number matching transmitted Link number and Lane = PAD.",
          "contextTags": [
            "Configuration",
            "Linkwidth",
            "TS1",
            "Consecutive2",
            "PAD"
          ]
        },
        {
          "from": "Configuration.Linkwidth.Start",
          "to": "Disabled",
          "condition": "Move if directed to assert Disable_Link_Request, or in crosslink optional case after required two consecutive Disable_Link_Request receptions.",
          "contextTags": [
            "Configuration",
            "Disabled",
            "Directed",
            "TS1"
          ]
        },
        {
          "from": "Configuration.Linkwidth.Start",
          "to": "Loopback",
          "condition": "Move if directed to Loopback as Loopback Lead, or on qualifying two-consecutive Loopback_Request receive conditions.",
          "contextTags": [
            "Configuration",
            "Loopback",
            "Directed",
            "TS1"
          ]
        },
        {
          "from": "Configuration.Linkwidth.Start",
          "to": "Detect.Quiet",
          "condition": "Move to Detect path after 24 ms timeout.",
          "contextTags": [
            "Configuration",
            "Detect",
            "Timeout24ms"
          ]
        },
        {
          "from": "Configuration.Linkwidth.Start",
          "to": "Configuration.Linkwidth.Start",
          "condition": "Crosslink optional (Downstream redesignated as Upstream Lanes): Downstream Lanes first send 16-32 TS1 with non-PAD Link and PAD Lane; if any Downstream Lane receives two consecutive TS1 with non-PAD Link and PAD Lane those Lanes are redesignated as Upstream Lanes with a new random T_crosslink timeout and re-enter this substate as Upstream Lanes (spec section 4.2.7.3.1).",
          "contextTags": [
            "Configuration",
            "Linkwidth",
            "Crosslink",
            "Redesignation",
            "Optional"
          ]
        },
        {
          "from": "Configuration.Linkwidth.Start",
          "to": "Configuration.Linkwidth.Start",
          "condition": "Crosslink optional (Upstream Lanes after T_crosslink timeout become Downstream): after T_crosslink timeout expires Upstream Lanes send 16-32 TS2 with PAD Link and Lane numbers and re-enter this substate as Downstream Lanes (spec section 4.2.7.3.1).",
          "contextTags": [
            "Configuration",
            "Linkwidth",
            "Crosslink",
            "T_crosslink",
            "Optional"
          ]
        },
        {
          "from": "Configuration.Linkwidth.Accept",
          "to": "Configuration.Lanenum.Wait",
          "condition": "Move when a configured link can be formed using qualifying lanes and non-PAD Link number criteria.",
          "contextTags": [
            "Configuration",
            "Linkwidth",
            "Lanenum",
            "TS1",
            "LinkFormation"
          ]
        },
        {
          "from": "Configuration.Linkwidth.Accept",
          "to": "Detect.Quiet",
          "condition": "Move to Detect path after 2 ms timeout, if no link can be configured, or if all lanes receive TS1 with Link and Lane = PAD.",
          "contextTags": [
            "Configuration",
            "Detect",
            "Timeout2ms",
            "PAD"
          ]
        },
        {
          "from": "Configuration.Lanenum.Wait",
          "to": "Configuration.Lanenum.Accept",
          "condition": "Downstream: move when lane numbers change from entry values and not all links are PAD, or when all lanes receive two consecutive TS1 matching transmitted Link/Lane.",
          "contextTags": [
            "Configuration",
            "Lanenum",
            "TS1",
            "Consecutive2"
          ]
        },
        {
          "from": "Configuration.Lanenum.Wait",
          "to": "Configuration.Lanenum.Accept",
          "condition": "Upstream: move when lane numbers change from entry values and not all links are PAD, or when any lane receives two consecutive TS2.",
          "contextTags": [
            "Configuration",
            "Lanenum",
            "TS1",
            "TS2",
            "Consecutive2"
          ]
        },
        {
          "from": "Configuration.Lanenum.Wait",
          "to": "Detect.Quiet",
          "condition": "Move to Detect path after 2 ms timeout or if all lanes receive two consecutive TS1 with Link and Lane = PAD.",
          "contextTags": [
            "Configuration",
            "Detect",
            "Timeout2ms",
            "PAD"
          ]
        },
        {
          "from": "Configuration.Lanenum.Accept",
          "to": "Configuration.Complete",
          "condition": "Downstream: move when two consecutive TS1 (or Modified TS1 if enabled) are received with non-PAD Link/Lane numbers matching transmitted assignment, including optional lane reversal rule.",
          "contextTags": [
            "Configuration",
            "Lanenum",
            "Complete",
            "TS1",
            "ModifiedTS",
            "Consecutive2"
          ]
        },
        {
          "from": "Configuration.Lanenum.Accept",
          "to": "Configuration.Complete",
          "condition": "Upstream: move when two consecutive TS2 are received with non-PAD Link/Lane numbers matching transmitted Upstream TS1 assignment.",
          "contextTags": [
            "Configuration",
            "Lanenum",
            "Complete",
            "TS2",
            "Consecutive2"
          ]
        },
        {
          "from": "Configuration.Lanenum.Accept",
          "to": "Configuration.Lanenum.Wait",
          "condition": "Move if a configured link can be formed only by reassigning sequential lane numbers over a valid continuous lane grouping.",
          "contextTags": [
            "Configuration",
            "Lanenum",
            "Reassignment",
            "TS1"
          ]
        },
        {
          "from": "Configuration.Lanenum.Accept",
          "to": "Detect.Quiet",
          "condition": "Move to Detect path if no link can be configured or if all lanes receive two consecutive TS1 with Link and Lane = PAD.",
          "contextTags": [
            "Configuration",
            "Detect",
            "PAD",
            "Consecutive2"
          ]
        },
        {
          "from": "Configuration.Complete",
          "to": "Configuration.Idle",
          "condition": "Move when all transmitting lanes receive 8 consecutive TS2 with matching non-PAD Link/Lane numbers and identical data-rate identifier fields, and 16 TS2 are sent after first TS2 receive.",
          "contextTags": [
            "Configuration",
            "Complete",
            "Idle",
            "TS2",
            "Consecutive8",
            "Transmit16"
          ]
        },
        {
          "from": "Configuration.Complete",
          "to": "Configuration.Idle",
          "condition": "After 2 ms timeout, move to Configuration.Idle at 8.0 GT/s or higher if idle_to_rlock_transitioned is less than FFh.",
          "contextTags": [
            "Configuration",
            "Complete",
            "Idle",
            "Timeout2ms",
            "HighRate"
          ]
        },
        {
          "from": "Configuration.Complete",
          "to": "Detect.Quiet",
          "condition": "After 2 ms timeout at 2.5 GT/s or 5.0 GT/s, or otherwise when high-rate timeout path does not qualify, move to Detect path.",
          "contextTags": [
            "Configuration",
            "Complete",
            "Detect",
            "Timeout2ms"
          ]
        },
        {
          "from": "Configuration.Idle",
          "to": "L0",
          "condition": "8b/10b Non-Flit: move when 8 consecutive symbol times of Idle data are received on all configured lanes and 16 Idle symbols are sent after first Idle receive.",
          "contextTags": [
            "Configuration",
            "Idle",
            "L0",
            "8b/10b",
            "Non-Flit",
            "IdleData"
          ]
        },
        {
          "from": "Configuration.Idle",
          "to": "L0",
          "condition": "128b/130b Non-Flit: move when 8 consecutive symbol times of Idle data are received and one Idle symbol is sent, with lane-to-lane deskew complete.",
          "contextTags": [
            "Configuration",
            "Idle",
            "L0",
            "128b/130b",
            "Non-Flit",
            "Deskew"
          ]
        },
        {
          "from": "Configuration.Idle",
          "to": "L0",
          "condition": "Flit Mode: move when two consecutive IDLE Flits are received and minimum required IDLE Flits are sent after first IDLE Flit receive.",
          "contextTags": [
            "Configuration",
            "Idle",
            "L0",
            "Flit",
            "IDLEFlit"
          ]
        },
        {
          "from": "Configuration.Idle",
          "to": "Recovery.RcvrLock",
          "condition": "Move after minimum 2 ms timeout if idle_to_rlock_transitioned is less than FFh.",
          "contextTags": [
            "Configuration",
            "Idle",
            "Recovery",
            "Timeout2ms"
          ]
        },
        {
          "from": "Configuration.Idle",
          "to": "Detect.Quiet",
          "condition": "Move after minimum 2 ms timeout if idle_to_rlock_transitioned equals FFh.",
          "contextTags": [
            "Configuration",
            "Idle",
            "Detect",
            "Timeout2ms"
          ]
        },
        {
          "from": "Configuration.Complete",
          "to": "Configuration.Idle",
          "condition": "Alternate Protocol Negotiation path: if use_modified_TS1_TS2_Ordered_Set = 1b and Alternate Protocol Negotiation is in progress, the transition to Configuration.Idle is delayed up to 10 s or until the Downstream Port receives the Upstream Port protocol response (whichever comes first), then moves to Configuration.Idle (spec section 4.2.7.3.5 AP negotiation path).",
          "contextTags": [
            "Configuration",
            "Complete",
            "Idle",
            "AlternateProtocol",
            "ModifiedTS2",
            "Timeout10s"
          ]
        }
      ]
    }
  },
  "recovery": {
    "title": "Recovery",
    "diagrams": {
      "spec": "diagrams/recovery.svg"
    },
    "descriptions": {
      "spec": "Recovery.RcvrLock, Recovery.RcvrCfg, Recovery.Speed, and Recovery.Idle transitions extracted from markdown source."
    },
    "transitions": {
      "spec": [
        {
          "from": "Recovery.RcvrLock",
          "to": "Recovery.RcvrCfg",
          "condition": "Move when 8 consecutive TS1 or TS2 are received on all configured lanes with matching Link/Lane numbers, speed_change bit equals directed_speed_change, and EC = 00b for TS1 at 8.0 GT/s or higher.",
          "contextTags": [
            "Recovery",
            "RcvrLock",
            "RcvrCfg",
            "TS1",
            "TS2",
            "Consecutive8",
            "EC00"
          ]
        },
        {
          "from": "Recovery.RcvrLock",
          "to": "Recovery.Equalization",
          "condition": "Upstream move when 8 consecutive TS0 or TS1 are received on all configured lanes with equalization-entry qualifying conditions.",
          "contextTags": [
            "Recovery",
            "RcvrLock",
            "Equalization",
            "TS0",
            "TS1",
            "Consecutive8"
          ]
        },
        {
          "from": "Recovery.RcvrLock",
          "to": "Recovery.RcvrCfg",
          "condition": "After 24 ms timeout, move if any lane receives 8 consecutive qualifying TS1/TS2 with speed_change = 1b (or Flit PAD TS2 case) and data-rate criteria are met.",
          "contextTags": [
            "Recovery",
            "RcvrLock",
            "RcvrCfg",
            "Timeout24ms",
            "SpeedChange"
          ]
        },
        {
          "from": "Recovery.RcvrLock",
          "to": "Recovery.Speed",
          "condition": "After 24 ms timeout, move when speed-change failure criteria indicate fallback speed handling.",
          "contextTags": [
            "Recovery",
            "RcvrLock",
            "Speed",
            "Timeout24ms",
            "RateFallback"
          ]
        },
        {
          "from": "Recovery.RcvrLock",
          "to": "Configuration.Linkwidth.Start",
          "condition": "After 24 ms timeout, move to Configuration when directed_speed_change reset and matching-lane and speed criteria for Configuration transition are satisfied.",
          "contextTags": [
            "Recovery",
            "RcvrLock",
            "Configuration",
            "Timeout24ms"
          ]
        },
        {
          "from": "Recovery.RcvrLock",
          "to": "Detect.Quiet",
          "condition": "After 24 ms timeout, move to Detect path if no RcvrCfg/Speed/Configuration criteria are met.",
          "contextTags": [
            "Recovery",
            "RcvrLock",
            "Detect",
            "Timeout24ms",
            "Fallback"
          ]
        },
        {
          "from": "Recovery.RcvrCfg",
          "to": "Recovery.Speed",
          "condition": "Move when speed-change success criteria are met, including qualifying 8-consecutive TS2/EQ TS2 receive rules and required TS2 transmit-count rules.",
          "contextTags": [
            "Recovery",
            "RcvrCfg",
            "Speed",
            "TS2",
            "EQTS2",
            "Consecutive8",
            "SpeedChange"
          ]
        },
        {
          "from": "Recovery.RcvrCfg",
          "to": "Recovery.Idle",
          "condition": "Move when 8 consecutive TS2 with matching Link/Lane and speed_change = 0b are received at 2.5 GT/s path, with 16 TS2 transmitted after first qualifying TS2.",
          "contextTags": [
            "Recovery",
            "RcvrCfg",
            "Idle",
            "TS2",
            "Consecutive8",
            "Transmit16"
          ]
        },
        {
          "from": "Recovery.RcvrCfg",
          "to": "Configuration.Linkwidth.Start",
          "condition": "Non-Flit: move on 8 consecutive TS1 with Link/Lane mismatch after 16 TS2 sent, under allowed speed_change and data-rate conditions.",
          "contextTags": [
            "Recovery",
            "RcvrCfg",
            "Configuration",
            "Non-Flit",
            "TS1",
            "TS2"
          ]
        },
        {
          "from": "Recovery.RcvrCfg",
          "to": "Configuration.Linkwidth.Start",
          "condition": "Flit: move after 1 ms and qualifying TS1/TS2 PAD scenarios with at least 16 TS2 transmitted and speed_change = 0b.",
          "contextTags": [
            "Recovery",
            "RcvrCfg",
            "Configuration",
            "Flit",
            "Timeout1ms",
            "PAD"
          ]
        },
        {
          "from": "Recovery.RcvrCfg",
          "to": "Recovery.Speed",
          "condition": "Move when EIOS or Electrical Idle is detected/inferred and no configured lane received TS2 since entering Recovery.RcvrCfg, using changed_speed_recovery rules.",
          "contextTags": [
            "Recovery",
            "RcvrCfg",
            "Speed",
            "EIOS",
            "ElectricalIdle",
            "RateFallback"
          ]
        },
        {
          "from": "Recovery.RcvrCfg",
          "to": "Recovery.Idle",
          "condition": "After 48 ms timeout at 8.0 GT/s or higher, move to Recovery.Idle if idle_to_rlock_transitioned is less than FFh.",
          "contextTags": [
            "Recovery",
            "RcvrCfg",
            "Idle",
            "Timeout48ms",
            "HighRate"
          ]
        },
        {
          "from": "Recovery.RcvrCfg",
          "to": "Detect.Quiet",
          "condition": "After 48 ms timeout, move to Detect path at 2.5/5.0 GT/s or if high-rate timeout fallback criteria are not met.",
          "contextTags": [
            "Recovery",
            "RcvrCfg",
            "Detect",
            "Timeout48ms",
            "Fallback"
          ]
        },
        {
          "from": "Recovery.Speed",
          "to": "Recovery.RcvrLock",
          "condition": "Move when transmitter-lane Electrical Idle hold requirements are completed and rate-change action is applied per successful/unsuccessful negotiation rules.",
          "contextTags": [
            "Recovery",
            "Speed",
            "RcvrLock",
            "ElectricalIdle",
            "RateChange"
          ]
        },
        {
          "from": "Recovery.Speed",
          "to": "Detect.Quiet",
          "condition": "Move after 48 ms timeout if entry speed was below 64.0 GT/s, or after 96 ms/48 ms timeout rules if entry speed was 64.0 GT/s or higher.",
          "contextTags": [
            "Recovery",
            "Speed",
            "Detect",
            "Timeout48ms",
            "Timeout96ms"
          ]
        },
        {
          "from": "Recovery.Idle",
          "to": "L0",
          "condition": "8b/10b Non-Flit: move when 8 consecutive symbol times of Idle data are received on all configured lanes and 16 Idle symbols are sent after first Idle receive.",
          "contextTags": [
            "Recovery",
            "Idle",
            "L0",
            "8b/10b",
            "Non-Flit",
            "IdleData"
          ]
        },
        {
          "from": "Recovery.Idle",
          "to": "L0",
          "condition": "128b/130b Non-Flit: move when 8 consecutive symbol times of Idle data are received, 16 Idle symbols are sent after first Idle receive, and state was not entered by Recovery.RcvrCfg timeout.",
          "contextTags": [
            "Recovery",
            "Idle",
            "L0",
            "128b/130b",
            "Non-Flit"
          ]
        },
        {
          "from": "Recovery.Idle",
          "to": "L0",
          "condition": "Flit Mode: move when two consecutive IDLE Flits are received and minimum IDLE Flits sent after first receive (4 for 8b/10b or 128b/130b, 8 for 1b/1b), and state was not entered by Recovery.RcvrCfg timeout.",
          "contextTags": [
            "Recovery",
            "Idle",
            "L0",
            "Flit",
            "IDLEFlit"
          ]
        },
        {
          "from": "Recovery.Idle",
          "to": "Disabled",
          "condition": "Move if directed by higher layer, or in applicable receive-driven request cases.",
          "contextTags": [
            "Recovery",
            "Idle",
            "Disabled",
            "Directed"
          ]
        },
        {
          "from": "Recovery.Idle",
          "to": "Hot Reset",
          "condition": "Move if directed by higher layer, or in applicable receive-driven request cases.",
          "contextTags": [
            "Recovery",
            "Idle",
            "HotReset",
            "Directed"
          ]
        },
        {
          "from": "Recovery.Idle",
          "to": "Configuration.Linkwidth.Start",
          "condition": "Move if directed for link reconfiguration, or on qualifying receive conditions such as two consecutive TS1 with Lane number PAD.",
          "contextTags": [
            "Recovery",
            "Idle",
            "Configuration",
            "Directed",
            "TS1",
            "PAD"
          ]
        },
        {
          "from": "Recovery.Idle",
          "to": "Loopback",
          "condition": "Move if directed and Loopback Lead capable, or on qualifying loopback-request receive conditions.",
          "contextTags": [
            "Recovery",
            "Idle",
            "Loopback",
            "Directed",
            "TS1",
            "TS2"
          ]
        },
        {
          "from": "Recovery.Idle",
          "to": "Recovery.RcvrLock",
          "condition": "After 2 ms timeout, move if idle_to_rlock_transitioned is less than FFh.",
          "contextTags": [
            "Recovery",
            "Idle",
            "RcvrLock",
            "Timeout2ms"
          ]
        },
        {
          "from": "Recovery.Idle",
          "to": "Detect.Quiet",
          "condition": "After 2 ms timeout, move if idle_to_rlock_transitioned equals FFh.",
          "contextTags": [
            "Recovery",
            "Idle",
            "Detect",
            "Timeout2ms"
          ]
        }
      ]
    }
  },
  "equalization": {
    "title": "Equalization",
    "diagrams": {
      "spec": "diagrams/equalization.svg"
    },
    "descriptions": {
      "spec": "Recovery.Equalization phase transitions extracted from markdown source, including 64.0 GT/s TS0/TS1 phase behavior."
    },
    "transitions": {
      "spec": [
        {
          "from": "Recovery.Equalization.Phase1.Downstream",
          "to": "Recovery.Equalization.Phase2.Downstream",
          "condition": "Move when all configured lanes receive two consecutive TS0/TS1 with EC = 01b and Downstream chooses to execute Phases 2 and 3.",
          "contextTags": [
            "Equalization",
            "Downstream",
            "Phase1",
            "Phase2",
            "EC01",
            "Consecutive2"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase1.Downstream",
          "to": "Recovery.RcvrLock",
          "condition": "Move when all configured lanes receive two consecutive TS0/TS1 with EC = 01b and Downstream chooses to skip Phases 2 and 3.",
          "contextTags": [
            "Equalization",
            "Downstream",
            "Phase1",
            "RcvrLock",
            "EC01",
            "Consecutive2"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase1.Downstream",
          "to": "Loopback.Entry",
          "condition": "Move after 24 ms timeout when perform_equalization_for_loopback is 1b.",
          "contextTags": [
            "Equalization",
            "Downstream",
            "Phase1",
            "Loopback",
            "Timeout24ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase1.Downstream",
          "to": "Recovery.Speed",
          "condition": "Move after 24 ms timeout when perform_equalization_for_loopback is 0b.",
          "contextTags": [
            "Equalization",
            "Downstream",
            "Phase1",
            "Speed",
            "Timeout24ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase2.Downstream",
          "to": "Recovery.Equalization.Phase3.Downstream",
          "condition": "Move when all configured lanes receive two consecutive TS0/TS1 with EC = 11b.",
          "contextTags": [
            "Equalization",
            "Downstream",
            "Phase2",
            "Phase3",
            "EC11",
            "Consecutive2"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase2.Downstream",
          "to": "Loopback.Entry",
          "condition": "Move on timeout: 32 ms (<64.0 GT/s) or 64 ms (64.0 GT/s) when perform_equalization_for_loopback is 1b.",
          "contextTags": [
            "Equalization",
            "Downstream",
            "Phase2",
            "Loopback",
            "Timeout32ms",
            "Timeout64ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase2.Downstream",
          "to": "Recovery.Speed",
          "condition": "Move on timeout: 32 ms (<64.0 GT/s) or 64 ms (64.0 GT/s) when perform_equalization_for_loopback is 0b.",
          "contextTags": [
            "Equalization",
            "Downstream",
            "Phase2",
            "Speed",
            "Timeout32ms",
            "Timeout64ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase3.Downstream",
          "to": "Recovery.RcvrLock",
          "condition": "Move when perform_equalization_for_loopback is 0b and all configured lanes are at optimal settings, with required TS1/Retimer criteria.",
          "contextTags": [
            "Equalization",
            "Downstream",
            "Phase3",
            "RcvrLock",
            "OptimalSetting"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase3.Downstream",
          "to": "Loopback.Entry",
          "condition": "Move for loopback flow on lane-under-test optimal setting with required TS1/Retimer criteria, or by timeout path (24/48 ms by rate).",
          "contextTags": [
            "Equalization",
            "Downstream",
            "Phase3",
            "Loopback",
            "Timeout24ms",
            "Timeout48ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase3.Downstream",
          "to": "Recovery.Speed",
          "condition": "Move on timeout path (24 ms for <64.0 GT/s, 48 ms for 64.0 GT/s).",
          "contextTags": [
            "Equalization",
            "Downstream",
            "Phase3",
            "Speed",
            "Timeout24ms",
            "Timeout48ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase0.Upstream",
          "to": "Recovery.Equalization.Phase1.Upstream",
          "condition": "Move when all configured lanes receive two consecutive TS1 with EC = 01b, or TS0 with EC = 01b and Retimer Equalization Extend = 0b.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase0",
            "Phase1",
            "EC01",
            "Consecutive2"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase0.Upstream",
          "to": "Loopback.Entry",
          "condition": "Move after 12 ms timeout when perform_equalization_for_loopback is 1b.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase0",
            "Loopback",
            "Timeout12ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase0.Upstream",
          "to": "Recovery.Speed",
          "condition": "Move after 12 ms timeout when perform_equalization_for_loopback is 0b.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase0",
            "Speed",
            "Timeout12ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase1.Upstream",
          "to": "Recovery.Equalization.Phase2.Upstream",
          "condition": "Move when all configured lanes receive two consecutive TS0/TS1 with EC = 10b.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase1",
            "Phase2",
            "EC10",
            "Consecutive2"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase1.Upstream",
          "to": "Recovery.RcvrLock",
          "condition": "Move when all configured lanes receive eight consecutive TS0/TS1 with EC = 00b and perform_equalization_for_loopback is 0b.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase1",
            "RcvrLock",
            "EC00",
            "Consecutive8"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase1.Upstream",
          "to": "Loopback.Entry",
          "condition": "Move after 12 ms timeout when perform_equalization_for_loopback is 1b.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase1",
            "Loopback",
            "Timeout12ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase1.Upstream",
          "to": "Recovery.Speed",
          "condition": "Move after 12 ms timeout when perform_equalization_for_loopback is 0b.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase1",
            "Speed",
            "Timeout12ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase2.Upstream",
          "to": "Recovery.Equalization.Phase3.Upstream",
          "condition": "Move when lane-under-test or all configured lanes reach optimal setting and required Retimer criteria are satisfied.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase2",
            "Phase3",
            "OptimalSetting"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase2.Upstream",
          "to": "Loopback.Entry",
          "condition": "Move on timeout: 24 ms (<64.0 GT/s) or 48 ms (64.0 GT/s) when perform_equalization_for_loopback is 1b.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase2",
            "Loopback",
            "Timeout24ms",
            "Timeout48ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase2.Upstream",
          "to": "Recovery.Speed",
          "condition": "Move on timeout: 24 ms (<64.0 GT/s) or 48 ms (64.0 GT/s) when perform_equalization_for_loopback is 0b.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase2",
            "Speed",
            "Timeout24ms",
            "Timeout48ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase3.Upstream",
          "to": "Recovery.RcvrLock",
          "condition": "Move when all configured lanes receive two consecutive TS1 with EC = 00b.",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase3",
            "RcvrLock",
            "EC00",
            "Consecutive2"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase3.Upstream",
          "to": "Loopback.Entry",
          "condition": "Move for loopback flow on lane-under-test two consecutive TS1 with EC = 00b, or on timeout path (32/64 ms by rate).",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase3",
            "Loopback",
            "Timeout32ms",
            "Timeout64ms"
          ]
        },
        {
          "from": "Recovery.Equalization.Phase3.Upstream",
          "to": "Recovery.Speed",
          "condition": "Move on timeout path (32 ms for <64.0 GT/s, 64 ms for 64.0 GT/s).",
          "contextTags": [
            "Equalization",
            "Upstream",
            "Phase3",
            "Speed",
            "Timeout32ms",
            "Timeout64ms"
          ]
        }
      ]
    }
  },
  "power": {
    "title": "Power Management",
    "diagrams": {
      "spec": "diagrams/power.svg"
    },
    "descriptions": {
      "spec": "No power-management markdown files were provided in the current extracted content set."
    },
    "transitions": {
      "spec": []
    }
  },
  "exceptional": {
    "title": "Exceptional States",
    "diagrams": {
      "spec": "diagrams/exceptional.svg"
    },
    "descriptions": {
      "spec": "No exceptional-state markdown files were provided in the current extracted content set."
    },
    "transitions": {
      "spec": []
    }
  }
};
