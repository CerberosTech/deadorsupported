---
title: "Can My PC Run Windows 11? How to Check (2026)"
description: "Windows 11's official requirements, how to check with PC Health Check, the TPM 2.0 and CPU rules, and what to do if your PC fails."
slug: can-my-pc-run-windows-11
updated: 2026-10-17
---

# Can my PC run Windows 11?

**Quickest way to find out:** install Microsoft's free **PC Health Check** app on your Windows 10 PC and select **Check now**. It tells you whether your PC is eligible, and if it isn't, why.

## The official minimum requirements
From Microsoft's Windows 11 specifications page:

| Component | Minimum |
|---|---|
| Processor | 1 GHz or faster, 2 or more cores, on a **compatible** 64-bit processor or SoC |
| RAM | 4 GB |
| Storage | 64 GB or more |
| Firmware | UEFI, Secure Boot capable |
| TPM | Trusted Platform Module (TPM) **version 2.0** |
| Graphics | DirectX 12 or later with a WDDM 2.0 driver |
| Display | HD (720p), larger than 9" diagonally, 8 bits per colour channel |

Windows 11 Home (and Pro for personal use) also needs an internet connection and a Microsoft account during setup. To upgrade from Windows 10, your PC must be running Windows 10 version 2004 or later.

## Step 1: run PC Health Check
1. Search for **PC Health Check** on the taskbar. If it isn't installed, get it from Microsoft at https://aka.ms/GetPCHealthCheckApp.
2. Select **Check now** under "Introducing Windows 11".
3. Read the result. It names the requirement your PC fails, such as TPM, Secure Boot or the processor.

Microsoft notes that PC Health Check doesn't check the graphics card or display, because most compatible devices meet those requirements.

## Step 2: understand the two usual blockers
**TPM 2.0.** Many PCs from roughly the last decade have a TPM built into the processor, but it may be turned off in the firmware (BIOS/UEFI) settings. Intel calls it PTT and AMD calls it fTPM. Microsoft has a guide to enabling TPM 2.0 (linked below). Turning on **Secure Boot** works the same way, in the same settings.

**The processor.** "Compatible" means your CPU appears on Microsoft's supported processor lists. Microsoft publishes separate lists for **Intel, AMD and Qualcomm** chips. Older chips are often missing from them, so look up your exact model. You'll find it under **Settings > System > About**.

## Step 3: if your PC fails
- **Only TPM or Secure Boot failed?** Turn them on in the firmware settings, then run PC Health Check again. Check your PC maker's support pages for the exact steps.
- **The CPU isn't on the list?** No setting will fix that. Your realistic options are:
  - Windows 10 **Extended Security Updates**, which run until 12 October 2027 (see [Is Windows 10 still supported?](../is-windows-10-still-supported/index.html));
  - switching to **Linux** or **ChromeOS Flex**, both free;
  - replacing the PC. A **refurbished** Windows 11 laptop from a reputable seller with a warranty is a sensible, cheaper choice.

## What about unofficial bypasses?
There are well-known tricks (registry edits, modified installers and third-party tools) for installing Windows 11 on unsupported hardware. Be clear about what Microsoft says about them:
- Installing on ineligible hardware is **not recommended**, and the device **won't receive support from Microsoft**.
- Such devices "aren't guaranteed to receive updates, including but not limited to security updates".
- Damage caused by compatibility problems **isn't covered by the manufacturer warranty**. You'll also see a watermark on the desktop.
- Microsoft recommends going back to Windows 10 if problems appear. The built-in "Go back" option only works for **10 days** after upgrading.

Our take: a bypass can work today and break with a future update. For a PC you depend on, it's a gamble, not a fix.

## Buying a used replacement?

A cheap used laptop can still be a bad deal if it is locked to someone else's account, reported stolen, or close to its own end-of-support date. Our own guide, [Safe to Buy Used? The Second-Hand Phone & Gadget Checklist](https://deadorsupported.gumroad.com/l/bqlcoi), walks you through the checks to do before you pay. It is a paid PDF we make ourselves; checking a model on our [device list](../../index.html) stays free.

Looking for a replacement with years of updates left? Compare prices for [Windows 11 laptops at bol.com](https://partner.bol.com/click/click?t=url&s=1550553&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fs%2F%3Fsearchtext%3Dwindows%252011%2520laptop&f=txl&name=can-my-pc-run-windows-11) (search results; check the seller, condition and warranty before you buy).

*Affiliate disclosure: bol.com links are affiliate links; we may earn a small commission at no extra cost to you. See our [disclosure](../../disclosure.html).*

## Sources
- Microsoft, Windows 11 specifications and system requirements: https://www.microsoft.com/en-us/windows/windows-11-specifications
- Microsoft Support, How to use the PC Health Check app: https://support.microsoft.com/en-us/windows/how-to-use-the-pc-health-check-app-9c8abd9b-03ba-4e67-81ef-36f37caa7844
- Microsoft Support, Enable TPM 2.0 on your PC: https://support.microsoft.com/en-us/windows/enable-tpm-2-0-on-your-pc-1fd5a332-360d-4f46-a1e7-ae6b0c90645c
- Microsoft Learn, supported processors (Windows 11 24H2): Intel https://learn.microsoft.com/en-us/windows-hardware/design/minimum/supported/windows-11-24h2-supported-intel-processors , AMD https://learn.microsoft.com/en-us/windows-hardware/design/minimum/supported/windows-11-24h2-supported-amd-processors , Qualcomm https://learn.microsoft.com/en-us/windows-hardware/design/minimum/supported/windows-11-24h2-supported-qualcomm-processors
- Microsoft Support, Windows 11 on devices that don't meet minimum system requirements: https://support.microsoft.com/en-us/windows/installing-windows-11-on-devices-that-don-t-meet-minimum-system-requirements-0b2dc4a2-5933-4ad4-9c09-ef0a331518f1
