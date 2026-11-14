import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFString, rgb, StandardFonts } from 'pdf-lib';

async function generatePDF() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('The 7-Day Gentle Gut Reset Guide');
  pdfDoc.setAuthor('Everyday Gut Wellness');
  pdfDoc.setSubject('An educational habit observation guide for adults; not medical advice');

  // Color Palette matching the website
  const colorForest = rgb(20 / 255, 56 / 255, 43 / 255);       // #14382B
  const colorTerracotta = rgb(184 / 255, 93 / 255, 54 / 255);   // #B85D36
  const colorText = rgb(44 / 255, 42 / 255, 38 / 255);          // #2C2A26
  const colorMuted = rgb(99 / 255, 95 / 255, 87 / 255);         // #635F57
  const colorBgCream = rgb(251 / 255, 249 / 255, 245 / 255);    // #FBF9F5
  const colorCardBg = rgb(243 / 255, 239 / 255, 230 / 255);     // #F3EFE6
  const colorWhite = rgb(1, 1, 1);
  const colorBorder = rgb(229 / 255, 223 / 255, 213 / 255);     // #E5DFD5
  const colorLightGreen = rgb(234 / 255, 241 / 255, 237 / 255); // #EAF1ED

  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Helper to add clean pages with header and footer
  function createPage(title, pageNum, totalPages = '8') {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Portrait
    const { width, height } = page.getSize();

    // Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: colorBgCream,
    });

    // Top border line
    page.drawRectangle({
      x: 40,
      y: height - 42,
      width: width - 80,
      height: 1.5,
      color: colorForest,
    });

    // Header Text
    page.drawText('EVERYDAY GUT WELLNESS  |  THE 7-DAY GENTLE GUT RESET', {
      x: 40,
      y: height - 36,
      size: 7.5,
      font: helveticaBold,
      color: colorForest,
    });

    page.drawText(title.toUpperCase(), {
      x: width - 40 - helvetica.widthOfTextAtSize(title.toUpperCase(), 7.5),
      y: height - 36,
      size: 7.5,
      font: helvetica,
      color: colorMuted,
    });

    // Footer Text
    page.drawLine({
      start: { x: 40, y: 38 },
      end: { x: width - 40, y: 38 },
      thickness: 0.5,
      color: colorBorder,
    });

    page.drawText('Free Educational Guide  |  everydaygutwellness.com', {
      x: 40,
      y: 26,
      size: 7.5,
      font: helvetica,
      color: colorMuted,
    });

    const pageStr = `Page ${pageNum} of ${totalPages}`;
    page.drawText(pageStr, {
      x: width - 40 - helvetica.widthOfTextAtSize(pageStr, 7.5),
      y: 26,
      size: 7.5,
      font: helveticaBold,
      color: colorForest,
    });

    return page;
  }

  // --- PAGE 1: COVER PAGE ---
  const coverPage = pdfDoc.addPage([595.28, 841.89]);
  {
    const { width, height } = coverPage.getSize();

    // Solid Forest Hero Area
    coverPage.drawRectangle({
      x: 0,
      y: height - 460,
      width,
      height: 460,
      color: colorForest,
    });

    // Top Badge
    coverPage.drawRectangle({
      x: 50,
      y: height - 85,
      width: 210,
      height: 24,
      color: rgb(30 / 255, 78 / 255, 60 / 255),
    });
    coverPage.drawText('COMPLIMENTARY WELLNESS EDITION', {
      x: 60,
      y: height - 76,
      size: 8,
      font: helveticaBold,
      color: rgb(210 / 255, 235 / 255, 225 / 255),
    });

    // Title
    coverPage.drawText('The 7-Day Gentle', {
      x: 50,
      y: height - 165,
      size: 34,
      font: timesRomanBold,
      color: colorWhite,
    });
    coverPage.drawText('Gut Reset Guide', {
      x: 50,
      y: height - 215,
      size: 44,
      font: timesRomanBold,
      color: rgb(234 / 255, 211 / 255, 199 / 255), // warm peach
    });

    // Subtitle
    coverPage.drawText('A practical seven-day plan for observing everyday habits,', {
      x: 50,
      y: height - 260,
      size: 13,
      font: helvetica,
      color: rgb(220 / 255, 235 / 255, 228 / 255),
    });
    coverPage.drawText('making gradual changes, and knowing when to seek support.', {
      x: 50,
      y: height - 280,
      size: 13,
      font: helvetica,
      color: rgb(220 / 255, 235 / 255, 228 / 255),
    });

    // Decorative Line
    coverPage.drawLine({
      start: { x: 50, y: height - 315 },
      end: { x: width - 50, y: height - 315 },
      thickness: 1,
      color: rgb(60 / 255, 110 / 255, 90 / 255),
    });

    // Author / Publisher credit
    coverPage.drawText('Published by Everyday Gut Wellness Editorial Team', {
      x: 50,
      y: height - 345,
      size: 10,
      font: helveticaBold,
      color: colorWhite,
    });
    coverPage.drawText('Educational information for general use; not a clinical review or personal medical advice.', {
      x: 50,
      y: height - 362,
      size: 9,
      font: helveticaOblique,
      color: rgb(180 / 255, 210 / 255, 195 / 255),
    });

    // Table of contents box (Lower Half)
    coverPage.drawRectangle({
      x: 50,
      y: 60,
      width: width - 100,
      height: 290,
      color: colorCardBg,
      borderColor: colorBorder,
      borderWidth: 1,
    });

    coverPage.drawText('TABLE OF CONTENTS', {
      x: 75,
      y: 315,
      size: 12,
      font: helveticaBold,
      color: colorForest,
    });

    const toc = [
      { num: 'Ch. 1', title: 'How Digestion Works & What a Diary Can Tell You', page: 'Page 2' },
      { num: 'Ch. 2', title: 'Five Habits to Observe and Adapt', page: 'Page 3' },
      { num: 'Ch. 3', title: 'Your Seven-Day Observation Plan', page: 'Page 4' },
      { num: 'Ch. 4', title: 'Food Experiments Without Blanket Restrictions', page: 'Page 5' },
      { num: 'Ch. 5', title: 'Printable Habit Checklist & Stool Notes', page: 'Page 6' },
      { num: 'Appx.', title: 'Warning Signs & Safety Boundaries', page: 'Page 7' },
      { num: 'Ref.', title: 'Next Steps, Sources & Limits of This Guide', page: 'Page 8' },
    ];

    let tocY = 285;
    for (const item of toc) {
      coverPage.drawText(item.num, {
        x: 75,
        y: tocY,
        size: 9.5,
        font: helveticaBold,
        color: colorTerracotta,
      });
      coverPage.drawText(item.title, {
        x: 120,
        y: tocY,
        size: 9.5,
        font: helvetica,
        color: colorText,
      });
      coverPage.drawText(item.page, {
        x: width - 130,
        y: tocY,
        size: 9,
        font: helveticaBold,
        color: colorMuted,
      });
      tocY -= 28;
    }
  }

  // Helper function for wrapped paragraphs
  function drawParagraph(page, text, startX, startY, maxWidth, font, size, lineHeight, color) {
    const words = text.split(/\s+/);
    let line = '';
    let currentY = startY;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + (line === '' ? '' : ' ') + words[i];
      const testWidth = font.widthOfTextAtSize(testLine, size);

      if (testWidth > maxWidth && line !== '') {
        page.drawText(line, { x: startX, y: currentY, size, font, color });
        line = words[i];
        currentY -= lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line !== '') {
      page.drawText(line, { x: startX, y: currentY, size, font, color });
      currentY -= lineHeight;
    }
    return currentY;
  }

  function addLink(page, url, x, y, width, height) {
    const annotation = pdfDoc.context.register(pdfDoc.context.obj({
      Type: 'Annot', Subtype: 'Link', Rect: [x, y, x + width, y + height], Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) },
    }));
    page.node.addAnnot(annotation);
  }

  // --- PAGE 2: CHAPTER 1 ---
  {
    const page = createPage('Chapter 1: Physiology of Transit', 2);
    let y = 770;

    page.drawText('CHAPTER 1', { x: 50, y, size: 10, font: helveticaBold, color: colorTerracotta });
    y -= 24;
    page.drawText('The Enteric Nervous System & Transit Biology', { x: 50, y, size: 20, font: timesRomanBold, color: colorForest });
    y -= 30;

    y = drawParagraph(
      page,
      'Nerves, hormones, and muscles work together to move food through the digestive tract. The enteric nervous system is a network within the gut wall that helps coordinate this movement. Bowel patterns also vary between people. [1]',
      50, y, 495, helvetica, 10, 16, colorText
    );
    y -= 10;

    // Card: The Peristalsis Wave
    page.drawRectangle({
      x: 50, y: y - 110, width: 495, height: 110, color: colorCardBg, borderColor: colorBorder, borderWidth: 1
    });
    page.drawText('HOW DIGESTIVE TRANSIT WORKS (PERISTALSIS)', { x: 65, y: y - 22, size: 9.5, font: helveticaBold, color: colorForest });
    drawParagraph(
      page,
      'Muscle contractions called peristalsis move and mix food and liquid. The large intestine absorbs water as waste becomes stool. Nerves and hormones help control these processes. This overview cannot explain the cause of an individual symptom. [1]',
      65, y - 40, 465, helvetica, 8.5, 14, colorText
    );
    y -= 130;

    page.drawText('Observe your routine without imposing a fasting schedule', { x: 50, y, size: 13, font: timesRomanBold, color: colorForest });
    y -= 20;
    y = drawParagraph(
      page,
      'Use the tracker to notice meal timing and bathroom opportunities. This guide does not prescribe meal gaps, fasting, or food restriction. Keep any eating schedule recommended for your medical needs, medicines, or recovery plan.',
      50, y, 495, helvetica, 9.5, 15, colorText
    );
    y -= 15;

    // Callout Box
    page.drawRectangle({
      x: 50, y: y - 85, width: 495, height: 85, color: colorLightGreen, borderColor: rgb(180 / 255, 210 / 255, 195 / 255), borderWidth: 1
    });
    page.drawText('A RECORD IS A STARTING POINT, NOT A DIAGNOSIS', { x: 65, y: y - 20, size: 9, font: helveticaBold, color: colorForest });
    drawParagraph(
      page,
      'Constipation can have several causes, including medicines, pelvic floor problems, and other health conditions. Do not assume a symptom is your fault or caused only by stress or habits. Seek medical advice when symptoms persist or warning signs appear. [2]',
      65, y - 36, 465, helvetica, 8.5, 13.5, colorForest
    );
  }

  // --- PAGE 3: CHAPTER 2 ---
  {
    const page = createPage('Chapter 2: The 5 Foundations', 3);
    let y = 770;

    page.drawText('CHAPTER 2', { x: 50, y, size: 10, font: helveticaBold, color: colorTerracotta });
    y -= 24;
    page.drawText('The 5 Pillars of Sustainable Digestive Equilibrium', { x: 50, y, size: 20, font: timesRomanBold, color: colorForest });
    y -= 25;

    const pillars = [
      {
        num: 'Pillar 1',
        title: 'Morning Baseline Hydration',
        body: 'Keep a drink accessible at a time that suits you. Fluid needs vary; ask a health professional about an appropriate amount, especially if you have a fluid restriction. This guide sets no universal ounce target or water-temperature rule. [3]',
      },
      {
        num: 'Pillar 2',
        title: 'Gradual Fiber Choices',
        body: 'Fiber comes from foods such as oats, beans, fruit, and vegetables. Add it gradually and include suitable fluids. Choose foods and portions that fit your needs and tolerances; more is not always more comfortable. [3,5]',
      },
      {
        num: 'Pillar 3',
        title: 'Respecting the Gastrocolic Reflex',
        body: 'Eating helps the colon move stool. A regular bathroom opportunity after breakfast may be useful; respond to the urge when practical. Do not force a bowel movement or judge a day by whether one happened. [4]',
      },
      {
        num: 'Pillar 4',
        title: 'Comfortable Bathroom Position',
        body: 'Relax your muscles and consider a stable footrest if it is safe and comfortable for you. No exact angle or guaranteed relief is promised. Persistent pain or straining deserves professional advice. [4]',
      },
      {
        num: 'Pillar 5',
        title: 'Movement That Fits Your Day',
        body: 'Regular physical activity may help constipation. A short walk is one optional way to include movement; choose a safe duration and activity that fit your abilities and existing care advice. [4]',
      },
    ];

    for (const p of pillars) {
      page.drawRectangle({
        x: 50, y: y - 76, width: 495, height: 76, color: colorCardBg, borderColor: colorBorder, borderWidth: 1
      });
      page.drawText(`${p.num.toUpperCase()}: ${p.title}`, {
        x: 65, y: y - 18, size: 9.5, font: helveticaBold, color: colorForest
      });
      drawParagraph(page, p.body, 65, y - 32, 465, helvetica, 8.5, 13, colorText);
      y -= 90;
    }
  }

  // --- PAGE 4: CHAPTER 3 ---
  {
    const page = createPage('Chapter 3: The 7-Day Protocol', 4);
    let y = 770;

    page.drawText('CHAPTER 3', { x: 50, y, size: 10, font: helveticaBold, color: colorTerracotta });
    y -= 24;
    page.drawText('The 7-Day Gentle Gut Reset: Daily Action Protocol', { x: 50, y, size: 19, font: timesRomanBold, color: colorForest });
    y -= 25;

    const days = [
      { day: 'Day 1', focus: 'A Fluid Reminder That Fits Your Day', action: 'Choose one place to keep a drink accessible. Follow any clinician-set fluid limits; record your own routine rather than chasing a fixed volume.' },
      { day: 'Day 2', focus: 'A Gradual Fiber Choice', action: 'If appropriate for you, try a small portion of a familiar fiber-containing food. Keep the change modest and note comfort. Avoid changing several foods at once. [3]' },
      { day: 'Day 3', focus: 'The 15-Minute Unhurried Morning Window', action: 'Wake up 15 minutes earlier. Sit quietly after breakfast with a warm herbal tea. Do not bring your smartphone into the restroom.' },
      { day: 'Day 4', focus: 'A Comfortable Bathroom Setup', action: 'Check that the setup is safe and comfortable. A stable footrest is optional. Give yourself time, relax, and avoid forcing a bowel movement. [4]' },
      { day: 'Day 5', focus: 'Notice Food and Comfort Together', action: 'Record one familiar meal and how you felt. Beans and some other fiber foods can increase gas for some people; a diary may help a clinician or dietitian assess patterns. [5]' },
      { day: 'Day 6', focus: 'Choose Manageable Movement', action: 'Choose a short, comfortable movement break if it is safe for you. Record what fit your day; skip or adapt anything that conflicts with care advice.' },
      { day: 'Day 7', focus: 'Review Without Chasing a Perfect Score', action: 'Compare your notes with your starting point. Record what was useful, uncomfortable, or uncertain. Decide whether to continue one manageable habit or seek support.' },
    ];

    for (const d of days) {
      page.drawRectangle({
        x: 50, y: y - 62, width: 495, height: 62, color: colorCardBg, borderColor: colorBorder, borderWidth: 1
      });
      page.drawRectangle({
        x: 50, y: y - 62, width: 65, height: 62, color: colorForest
      });
      page.drawText(d.day, { x: 62, y: y - 35, size: 11, font: helveticaBold, color: colorWhite });

      page.drawText(d.focus.toUpperCase(), { x: 125, y: y - 18, size: 9, font: helveticaBold, color: colorTerracotta });
      drawParagraph(page, d.action, 125, y - 32, 405, helvetica, 8.5, 13, colorText);
      y -= 74;
    }
  }

  // --- PAGE 5: CHAPTER 4 ---
  {
    const page = createPage('Chapter 4: Smart Food Swaps', 5);
    let y = 770;

    page.drawText('CHAPTER 4', { x: 50, y, size: 10, font: helveticaBold, color: colorTerracotta });
    y -= 24;
    page.drawText('Food Experiments Without Blanket Restrictions', { x: 50, y, size: 19, font: timesRomanBold, color: colorForest });
    y -= 25;

    y = drawParagraph(
      page,
      'Some people find a gradual change easier to tolerate than adding a large amount of fiber all at once. Individual responses vary. Consider these gentle food examples as optional ideas, not a treatment plan:',
      50, y, 495, helvetica, 9.5, 15, colorText
    );
    y -= 15;

    const swaps = [
      { trigger: 'A sudden large fiber increase', swap: 'A smaller gradual change', why: 'Increase fiber gradually; watch your own tolerance. [3]' },
      { trigger: 'A food you suspect causes gas', swap: 'Record food, portion, and comfort', why: 'A diary can help a professional assess patterns. [5]' },
      { trigger: 'Beans or lentils causing gas', swap: 'Discuss a tolerable portion', why: 'Legumes can increase gas for some people. [5]' },
      { trigger: 'Frequent fizzy drinks', swap: 'Try a still drink you tolerate', why: 'Limiting fizzy drinks may reduce gas symptoms. [5]' },
      { trigger: 'Sugar alcohols on a label', swap: 'Compare a product without them', why: 'Sorbitol and similar sweeteners may increase gas. [5]' },
    ];

    // Swaps Table
    page.drawRectangle({
      x: 50, y: y - 280, width: 495, height: 280, color: colorCardBg, borderColor: colorBorder, borderWidth: 1
    });

    // Table Header
    page.drawRectangle({ x: 50, y: y - 25, width: 495, height: 25, color: colorForest });
    page.drawText('SITUATION TO NOTICE', { x: 60, y: y - 17, size: 8, font: helveticaBold, color: colorWhite });
    page.drawText('OPTION TO CONSIDER', { x: 210, y: y - 17, size: 8, font: helveticaBold, color: colorWhite });
    page.drawText('WHY IT MAY BE USEFUL', { x: 375, y: y - 17, size: 8, font: helveticaBold, color: colorWhite });

    let swapY = y - 45;
    for (const s of swaps) {
      drawParagraph(page, s.trigger, 60, swapY, 140, helveticaBold, 8, 11, colorTerracotta);
      drawParagraph(page, s.swap, 210, swapY, 150, helveticaBold, 8, 11, colorForest);
      drawParagraph(page, s.why, 375, swapY + 6, 160, helvetica, 7.5, 11, colorText);
      swapY -= 48;
      page.drawLine({ start: { x: 55, y: swapY + 8 }, end: { x: 540, y: swapY + 8 }, thickness: 0.5, color: colorBorder });
    }
  }

  // --- PAGE 6: CHAPTER 5 (PRINTABLE TRACKER) ---
  {
    const page = createPage('Chapter 5: Printable Daily Tracker', 6);
    let y = 770;

    page.drawText('CHAPTER 5 & DAILY TRACKER', { x: 50, y, size: 10, font: helveticaBold, color: colorTerracotta });
    y -= 24;
    page.drawText('Your 7-Day Habit Tracker & Stool Diary', { x: 50, y, size: 20, font: timesRomanBold, color: colorForest });
    y -= 18;

    y = drawParagraph(
      page,
      'Use this private record to describe your routine and stool appearance. It is not a scorecard or a diagnostic test. Adapt or skip habits that do not fit your health needs. Do not submit these health notes through the website form.',
      50, y, 495, helvetica, 9, 14, colorText
    );
    y -= 15;

    // Tracker Table Grid
    const rowHeight = 36;
    const tableTop = y;
    const tableWidth = 495;
    const daysArr = ['Habit Foundation', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Header Row
    page.drawRectangle({ x: 50, y: tableTop - 24, width: tableWidth, height: 24, color: colorForest });
    page.drawText(daysArr[0], { x: 58, y: tableTop - 16, size: 8, font: helveticaBold, color: colorWhite });
    for (let c = 1; c < daysArr.length; c++) {
      page.drawText(daysArr[c], { x: 230 + (c - 1) * 44, y: tableTop - 16, size: 8, font: helveticaBold, color: colorWhite });
    }

    const habits = [
      '1. My Appropriate Fluid Reminder',
      '2. Gradual Fiber Choice (If Suitable)',
      '3. Respect Unhurried Morning Window',
      '4. Safe, Comfortable Bathroom Setup',
      '5. Movement Within My Abilities',
      '6. Followed My Individual Fluid Advice',
      '7. Stool Type (Bristol 1 to 7 rating)',
      '8. Daily Bloating Rating (1=None, 5=Severe)',
    ];

    let rowY = tableTop - 24;
    for (let r = 0; r < habits.length; r++) {
      rowY -= rowHeight;
      const bg = r % 2 === 0 ? colorCardBg : colorWhite;
      page.drawRectangle({ x: 50, y: rowY, width: tableWidth, height: rowHeight, color: bg, borderColor: colorBorder, borderWidth: 0.5 });
      page.drawText(habits[r], { x: 58, y: rowY + 13, size: 8, font: helveticaBold, color: colorForest });

      for (let c = 1; c < daysArr.length; c++) {
        // Draw checkbox square or rating box
        page.drawRectangle({
          x: 236 + (c - 1) * 44,
          y: rowY + 9,
          width: 18,
          height: 18,
          color: colorWhite,
          borderColor: colorBorder,
          borderWidth: 1,
        });
      }
    }

    // Bristol Stool Chart Quick Reference at the bottom of Page 6
    const chartY = rowY - 145;
    page.drawRectangle({
      x: 50, y: chartY, width: tableWidth, height: 130, color: colorLightGreen, borderColor: colorBorder, borderWidth: 1
    });
    page.drawText('BRISTOL STOOL FORM SCALE QUICK REFERENCE', { x: 65, y: chartY + 112, size: 8.5, font: helveticaBold, color: colorForest });
    drawParagraph(
      page,
      'Types 1-2: hard lumps or lumpy stool. Types 3-4: formed, sausage-like stool. Types 5-7: softer blobs through to watery stool. These are descriptions, not diagnoses or instructions to change your fluid or fiber intake. Note pain, frequency, and persistent change as well. Seek advice for ongoing problems and use the warning signs on page 7.',
      65, chartY + 95, 465, helvetica, 8, 13, colorForest
    );
  }

  // --- PAGE 7: RED FLAGS & SAFETY ---
  {
    const page = createPage('Appendix: Medical Signs & Disclaimers', 7);
    let y = 770;

    page.drawText('APPENDIX & SAFETY GUIDELINES', { x: 50, y, size: 10, font: helveticaBold, color: colorTerracotta });
    y -= 24;
    page.drawText('When Lifestyle Isn\'t Enough: Medical Red Flags', { x: 50, y, size: 19, font: timesRomanBold, color: colorForest });
    y -= 25;

    y = drawParagraph(
      page,
      'While lifestyle improvements—hydration, fiber diversity, movement, and toilet posture—are foundational for digestive comfort, they are never a substitute for medical diagnosis. If you experience any of the following clinical warning signs, do not attempt to self-treat; contact a qualified healthcare physician or emergency care facility immediately:',
      50, y, 495, helvetica, 9.5, 15, colorText
    );
    y -= 15;

    const warnings = [
      { title: 'Rectal Bleeding or Blood in Stool', desc: 'Seek medical care promptly. Do not use the tracker to explain away bleeding. [2]' },
      { title: 'Constant or Severe Abdominal Pain', desc: 'Constipation with constant pain needs prompt care. Severe or sudden pain warrants urgent assessment. [2]' },
      { title: 'Inability to Pass Gas, Vomiting, or Fever', desc: 'With constipation, these symptoms require medical care right away. [2]' },
      { title: 'Losing Weight Without Trying', desc: 'Arrange prompt medical assessment, especially with constipation or other persistent changes. [2]' },
      { title: 'Symptoms Persist Despite Self-Care', desc: 'Ask a clinician for assessment. Do not wait for a fixed number of weeks if symptoms worry you or worsen. [2]' },
    ];

    for (const w of warnings) {
      page.drawRectangle({
        x: 50, y: y - 56, width: 495, height: 56, color: rgb(255 / 255, 245 / 255, 245 / 255), borderColor: rgb(240 / 255, 200 / 255, 200 / 255), borderWidth: 1
      });
      page.drawText(`!  ${w.title.toUpperCase()}`, { x: 65, y: y - 18, size: 9, font: helveticaBold, color: rgb(180 / 255, 40 / 255, 40 / 255) });
      drawParagraph(page, w.desc, 65, y - 32, 465, helvetica, 8.5, 13, colorText);
      y -= 68;
    }

    y -= 10;
    // Disclaimer Box
    page.drawRectangle({
      x: 50, y: y - 85, width: 495, height: 85, color: colorCardBg, borderColor: colorBorder, borderWidth: 1
    });
    page.drawText('IMPORTANT HEALTHCARE DISCLAIMER', { x: 65, y: y - 20, size: 9, font: helveticaBold, color: colorForest });
    drawParagraph(
      page,
      'The contents of this publication are provided for general educational purposes only and are not intended to serve as medical advice, clinical diagnosis, or individualized treatment plans. Always consult with your primary healthcare provider, gastroenterologist, or registered dietitian before beginning any new nutritional protocol, fiber supplement, or exercise routine.',
      65, y - 36, 465, helvetica, 8, 13, colorMuted
    );
  }

  // --- PAGE 8: COMPLIMENTARY RESOURCES & BACK COVER ---
  {
    const page = createPage('Resources & Reference Tools', 8);
    let y = 770;

    page.drawText('SUMMARY & NEXT STEPS', { x: 50, y, size: 10, font: helveticaBold, color: colorTerracotta });
    y -= 24;
    page.drawText('Sustaining Your Digestive Health Routine', { x: 50, y, size: 20, font: timesRomanBold, color: colorForest });
    y -= 25;

    y = drawParagraph(
      page,
      'Congratulations on taking proactive, informed steps toward restorative digestive health. The key to lasting digestive comfort is consistency rather than intensity. Implement small, manageable changes that fit your everyday schedule.',
      50, y, 495, helvetica, 9.5, 15, colorText
    );
    y -= 20;

    // Original Digital Product Feature Box
    page.drawRectangle({
      x: 50, y: y - 150, width: 495, height: 150, color: colorCardBg, borderColor: colorBorder, borderWidth: 1
    });
    page.drawText('LOOKING FOR STRUCTURED DAILY TRACKING? THE 30-DAY WELLNESS PLANNER', { x: 65, y: y - 22, size: 8.5, font: helveticaBold, color: colorForest });
    drawParagraph(
      page,
      'If you would like a separate planning tool, The 30-Day Gut Routine Planner is a 31-page printable workbook for choosing one routine, fitting it to your schedule, and adjusting it across changing weeks.\n\n' +
      'Current price: $30 USD. Gumroad handles checkout and delivery:\n' +
      'https://eiram32.gumroad.com/l/ynisjl',
      65, y - 42, 465, helvetica, 8.5, 14, colorText
    );
    addLink(page, 'https://eiram32.gumroad.com/l/ynisjl', 65, y - 128, 465, 108);
    y -= 175;

    // Final Closing Card
    page.drawRectangle({
      x: 50, y: y - 130, width: 495, height: 130, color: colorForest
    });
    page.drawText('THANK YOU FOR READING', { x: 65, y: y - 26, size: 12, font: helveticaBold, color: rgb(234 / 255, 211 / 255, 199 / 255) });
    drawParagraph(
      page,
      'Everyday Gut Wellness is dedicated to providing evidence-informed, transparent, and hype-free digestive health education. Share this free guide with family and friends who could benefit from a gentle, physiological approach to gut comfort.\n\n' +
      'Website: https://everydaygutwellness.com\n' +
      'For paid-product order or delivery support, use the contact link in your Gumroad receipt.',
      65, y - 48, 465, helvetica, 9, 15, colorWhite
    );

    y -= 155;
    page.drawText('SOURCES & LIMITS OF THIS GUIDE', { x: 50, y, size: 10, font: helveticaBold, color: colorForest });
    y -= 17;
    const references = [
      ['1. NIDDK: Your Digestive System & How It Works', 'https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works'],
      ['2. NIDDK: Symptoms & Causes of Constipation', 'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/symptoms-causes'],
      ['3. NIDDK: Eating, Diet, & Nutrition for Constipation', 'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/eating-diet-nutrition'],
      ['4. NIDDK: Treatment for Constipation', 'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/treatment'],
      ['5. NIDDK: Eating, Diet, & Nutrition for Gas', 'https://www.niddk.nih.gov/health-information/digestive-diseases/gas-digestive-tract/eating-diet-nutrition'],
    ];
    for (const [title, url] of references) {
      page.drawText(title, { x: 50, y, size: 8, font: helveticaBold, color: colorForest });
      page.drawText(url, { x: 50, y: y - 11, size: 6.6, font: helvetica, color: colorText });
      addLink(page, url, 50, y - 14, helvetica.widthOfTextAtSize(url, 6.6), 13);
      y -= 31;
    }
    drawParagraph(page, 'Sources checked November 14, 2026. They support general background, not endorsement of this guide. This edition is not clinician-reviewed. No seven-day outcome is guaranteed.', 50, y, 495, helvetica, 7.5, 11, colorMuted);
  }

  const pdfBytes = await pdfDoc.save();

  // Save to /public/The-7-Day-Gentle-Gut-Reset-Guide.pdf
  const publicPath = path.join(process.cwd(), 'public', 'The-7-Day-Gentle-Gut-Reset-Guide.pdf');
  fs.writeFileSync(publicPath, pdfBytes);
  console.log(`[Success] Generated PDF at ${publicPath} (${pdfBytes.length} bytes)`);

  // Also save with alternative naming for SEO / direct url matching
  const publicAltPath = path.join(process.cwd(), 'public', 'the-7-day-gentle-gut-reset-guide.pdf');
  fs.writeFileSync(publicAltPath, pdfBytes);
}

generatePDF().catch(err => {
  console.error('[Error] PDF generation failed:', err);
  process.exit(1);
});
