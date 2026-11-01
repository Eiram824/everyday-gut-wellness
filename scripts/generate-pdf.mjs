import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generatePDF() {
  const pdfDoc = await PDFDocument.create();

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

    page.drawText('Free Educational Guide  |  www.everyday-gut-wellness.netlify.app', {
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
    coverPage.drawText('A practical, evidence-grounded protocol for smoother motility,', {
      x: 50,
      y: height - 260,
      size: 13,
      font: helvetica,
      color: rgb(220 / 255, 235 / 255, 228 / 255),
    });
    coverPage.drawText('sustainable fiber balance, and natural bowel regularity without harsh detoxes.', {
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
    coverPage.drawText('Clinically reviewed guidelines aligned with gastroenterology fundamentals.', {
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
      { num: 'Ch. 1', title: 'The Physiology of Transit & The Gut-Brain Axis', page: 'Page 2' },
      { num: 'Ch. 2', title: 'The 5 Daily Pillars of Digestive Equilibrium', page: 'Page 3' },
      { num: 'Ch. 3', title: 'The 7-Day Actionable Reset Protocol (Day-by-Day)', page: 'Page 4' },
      { num: 'Ch. 4', title: 'Smart Fiber Swaps & Eliminating Bloat Triggers', page: 'Page 5' },
      { num: 'Ch. 5', title: 'Daily Printable Habit Checklist & Stool Consistency Log', page: 'Page 6' },
      { num: 'Appx.', title: 'Medical Red Flags, Safety Guidelines & Ingredient Transparency', page: 'Page 7' },
      { num: 'Ref.', title: 'Recommended Tools, Habit Support & Clinical References', page: 'Page 8' },
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
      'Your digestive tract contains over 500 million neurons—a complex biological network known as the Enteric Nervous System (ENS), or "the second brain." Digestion is not a passive mechanical pipe; it is an electrically synchronized muscular rhythm guided by the autonomic nervous system.',
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
      '1. Muscular Contraction: Ring-like smooth muscles push food bolus forward in rhythmic waves.\n' +
      '2. Moisture Extraction: The colon absorbs excess water to form compact stool. If transit is too slow, excess water is reabsorbed, resulting in hard, dry pellets (Bristol Type 1-2).\n' +
      '3. Autonomic Tone: When you are stressed or hurried, the "fight-or-flight" sympathetic branch shuts down gut motility. Regular bowel habits require "rest-and-digest" parasympathetic activation.',
      65, y - 40, 465, helvetica, 8.5, 14, colorText
    );
    y -= 130;

    page.drawText('The Migrating Motor Complex (MMC): The Gut\'s Housekeeper', { x: 50, y, size: 13, font: timesRomanBold, color: colorForest });
    y -= 20;
    y = drawParagraph(
      page,
      'Between meals, when your stomach and small intestine are empty for at least 90 to 120 minutes, the body initiates the Migrating Motor Complex (MMC). These sweeping electromechanical waves act as a biological broom, pushing residual food particles and bacteria into the large intestine.\n\n' +
      'Constant grazing or frequent snacking halts the MMC before it finishes its cleaning cycle. Allowing a 3 to 4-hour window between meals allows your natural motility sweeps to complete without interruption.',
      50, y, 495, helvetica, 9.5, 15, colorText
    );
    y -= 15;

    // Callout Box
    page.drawRectangle({
      x: 50, y: y - 85, width: 495, height: 85, color: colorLightGreen, borderColor: rgb(180 / 255, 210 / 255, 195 / 255), borderWidth: 1
    });
    page.drawText('CLINICAL TAKEAWAY FOR YOUR ROUTINE', { x: 65, y: y - 20, size: 9, font: helveticaBold, color: colorForest });
    drawParagraph(
      page,
      'Irregular bowel movements are rarely caused by a "lazy colon." They are almost always the result of disrupted autonomic signals: chronic low fluid intake, suppressed bathroom urges, sedentary posture, or excessive sympathetic stress during morning hours.',
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
        body: 'Upon waking, your body has gone 7 to 9 hours without fluids. Drinking 12 to 16 oz of room-temperature or lukewarm water activates gastric stretch receptors and replenishes the mucosal lining before any dehydrating diuretics (coffee or tea) are introduced.',
      },
      {
        num: 'Pillar 2',
        title: 'Soluble vs. Insoluble Fiber Synergy',
        body: 'Soluble fiber (found in oats, chia, beans, and pears) dissolves in water to create a soft, slippery gel. Insoluble fiber (vegetable skins, leafy greens, bran) provides structure and bulk. You need both working in harmony: soluble fiber softens, while insoluble fiber stimulates peristalsis.',
      },
      {
        num: 'Pillar 3',
        title: 'Respecting the Gastrocolic Reflex',
        body: 'Approximately 15 to 30 minutes after eating (especially warm breakfasts containing healthy fats or fluids), your stomach signals the colon to contract vigorously. This is the Gastrocolic Reflex. If you repeatedly delay or ignore this urge due to a rushed commute, the reflex blunts.',
      },
      {
        num: 'Pillar 4',
        title: 'Pelvic Floor Ergonomics (The 35° Squat Angle)',
        body: 'Modern 90° seated toilets create a kink in the rectum caused by the puborectalis muscle. Elevating your feet 6 to 8 inches on a small bathroom stool or footrest places the hips in a natural 35° squat posture, straightening the anorectal angle and eliminating painful straining.',
      },
      {
        num: 'Pillar 5',
        title: 'Post-Prandial Movement (The 10-Minute Walk)',
        body: 'A gentle 10 to 15-minute walk following lunch or dinner stimulates abdominal blood flow, accelerates gastric emptying, and helps gas circulate through the intestinal tract rather than trapping in painful pockets.',
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
      { day: 'Day 1', focus: 'Hydration Baseline & Fluid Anchor', action: 'Drink 16 oz lukewarm water upon waking. Carry a water bottle and aim for pale straw urine. Eliminate all carbonated sugary drinks.' },
      { day: 'Day 2', focus: 'Soluble Fiber Kickstart (Chia or Oats)', action: 'Add 1 tbsp of chia seeds or 1 cup rolled oats to your morning. Pair with an extra glass of water to allow the gel to expand safely.' },
      { day: 'Day 3', focus: 'The 15-Minute Unhurried Morning Window', action: 'Wake up 15 minutes earlier. Sit quietly after breakfast with a warm herbal tea. Do not bring your smartphone into the restroom.' },
      { day: 'Day 4', focus: 'Pelvic Ergonomics & Posture Alignment', action: 'Place a footstool in your bathroom. Practice deep diaphragmatic belly breathing (inhale into abdomen, slow exhale) to relax pelvic floor muscles.' },
      { day: 'Day 5', focus: 'Legumes & Plant Diversity Lunch', action: 'Add 1/2 cup cooked black beans or lentils to your lunch. Chew each bite thoroughly (20-30 times) to reduce fermentation gas.' },
      { day: 'Day 6', focus: 'Post-Meal Walking & Stress Downregulation', action: 'Take two dedicated 10-minute walks: one after lunch and one after dinner. Disconnect from work emails during meals.' },
      { day: 'Day 7', focus: 'Weekly Progress Review & Sustainable Rhythm', action: 'Review your stool consistency against the Bristol Scale. Notice improvements in bloating, energy, and bowel comfort. Lock in these 5 daily habits.' },
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
    page.drawText('Smart Fiber Swaps & Eliminating Bloat Triggers', { x: 50, y, size: 19, font: timesRomanBold, color: colorForest });
    y -= 25;

    y = drawParagraph(
      page,
      'When increasing dietary fiber, many people make the mistake of adding large amounts of raw cruciferous vegetables or coarse wheat bran all at once. This triggers sudden bacterial fermentation, resulting in painful gas and distension. Use these clinically proven gentle swaps instead:',
      50, y, 495, helvetica, 9.5, 15, colorText
    );
    y -= 15;

    const swaps = [
      { trigger: 'Coarse Raw Wheat Bran', swap: 'Rolled Oats or Ground Flaxseed', why: 'Oats provide gentle beta-glucans that soothe mucosal walls without scraping.' },
      { trigger: 'Raw Broccoli / Cauliflower Florets', swap: 'Steamed Zucchini, Carrots, or Spinach', why: 'Cooked tender vegetables break down cellulose fibers, reducing fermentation gas.' },
      { trigger: 'Unsoaked Dried Kidney Beans', swap: 'Rinsed Canned Lentils or Chickpeas', why: 'Canned lentils have already shed water-soluble oligosaccharides, making them gentle.' },
      { trigger: 'Sugary Carbonated Sodas', swap: 'Peppermint or Chamomile Infusion', why: 'Carbonation traps gas bubbles in the stomach; peppermint relaxes smooth intestinal muscle.' },
      { trigger: 'Artificial Sugar Alcohols (Sorbitol)', swap: 'Fresh Berries or Ripe Bartlett Pears', why: 'Sugar alcohols draw osmotic water erratically; fruit provides real moisture and pectin.' },
    ];

    // Swaps Table
    page.drawRectangle({
      x: 50, y: y - 280, width: 495, height: 280, color: colorCardBg, borderColor: colorBorder, borderWidth: 1
    });

    // Table Header
    page.drawRectangle({ x: 50, y: y - 25, width: 495, height: 25, color: colorForest });
    page.drawText('COMMON BLOAT TRIGGER', { x: 60, y: y - 17, size: 8, font: helveticaBold, color: colorWhite });
    page.drawText('GENTLE GUT-FRIENDLY SWAP', { x: 210, y: y - 17, size: 8, font: helveticaBold, color: colorWhite });
    page.drawText('PHYSIOLOGICAL BENEFIT', { x: 375, y: y - 17, size: 8, font: helveticaBold, color: colorWhite });

    let swapY = y - 45;
    for (const s of swaps) {
      page.drawText(s.trigger, { x: 60, y: swapY, size: 8, font: helveticaBold, color: colorTerracotta });
      page.drawText(s.swap, { x: 210, y: swapY, size: 8, font: helveticaBold, color: colorForest });
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
      'Print this page or keep it by your bedside. Place a checkmark each day you accomplish the foundational habit, and note your Bristol stool consistency (Goal: Type 3-4, smooth soft sausage).',
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
      '1. Morning 16 oz Hydration',
      '2. Soluble Fiber Added (Oats/Chia/Beans)',
      '3. Respect Unhurried Morning Window',
      '4. Bathroom Footstool / 35° Squat Angle',
      '5. 10+ Min Post-Meal Movement',
      '6. Adequate Daily Water (60+ oz)',
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
      '• Type 1-2 (Constipation / Sluggish Transit): Hard separate lumps or lumpy sausage. Indicates prolonged transit time and dehydration. Increase morning water and soluble fiber.\n' +
      '• Type 3-4 (IDEAL / Optimal Balance): Like a smooth soft sausage or snake. Comfortable to pass without straining.\n' +
      '• Type 5-7 (Loose / Rapid Transit): Soft blobs to watery liquid. Increase soluble fiber to absorb liquid and check for food sensitivities or acute causes.',
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
      { title: 'Rectal Bleeding or Black, Tarry Stool', desc: 'Can indicate active bleeding in the upper or lower GI tract. Requires prompt medical diagnosis.' },
      { title: 'Severe, Sudden, or Unbearable Abdominal Pain', desc: 'May signal acute appendicitis, bowel obstruction, or perforation requiring urgent clinical assessment.' },
      { title: 'Inability to Pass Gas Alongside Bowel Stoppage', desc: 'A key mechanical warning sign of bowel obstruction. Seek emergency evaluation.' },
      { title: 'Unintended, Rapid Weight Loss', desc: 'Losing weight without dieting warrants laboratory work and endoscopic evaluation.' },
      { title: 'Persistent Changes in Caliber or Frequency (> 3 Weeks)', desc: 'Pencil-thin stool or lasting alternating diarrhea/constipation requires physician evaluation.' },
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

    // Supplement & Botanical Overview Box
    page.drawRectangle({
      x: 50, y: y - 150, width: 495, height: 150, color: colorCardBg, borderColor: colorBorder, borderWidth: 1
    });
    page.drawText('OPTIONAL BOTANICAL MOTILITY SUPPORT: BellyFlush REVIEW', { x: 65, y: y - 22, size: 9.5, font: helveticaBold, color: colorForest });
    drawParagraph(
      page,
      'For individuals who struggle to hit daily fiber targets through whole food alone or experience recurring sluggishness during travel and busy work schedules, a gentle botanical formulation can offer supplementary support.\n\n' +
      'In our clinical breakdown, BellyFlush combines Psyllium Husk (soluble bulk fiber) with soothing Aloe Vera, Bentonite Clay, and L. Acidophilus probiotics. Unlike harsh stimulant laxatives (such as heavy senna), it works gently with your natural peristalsis.\n\n' +
      'Learn more and view official third-party transparency standards on our review page at:\n' +
      'https://everyday-gut-wellness.netlify.app/#product-review',
      65, y - 42, 465, helvetica, 8.5, 14, colorText
    );
    y -= 175;

    // Final Closing Card
    page.drawRectangle({
      x: 50, y: y - 130, width: 495, height: 130, color: colorForest
    });
    page.drawText('THANK YOU FOR READING', { x: 65, y: y - 26, size: 12, font: helveticaBold, color: rgb(234 / 255, 211 / 255, 199 / 255) });
    drawParagraph(
      page,
      'Everyday Gut Wellness is dedicated to providing evidence-informed, transparent, and hype-free digestive health education. Share this free guide with family and friends who could benefit from a gentle, physiological approach to gut comfort.\n\n' +
      'Official Website: https://everyday-gut-wellness.netlify.app\n' +
      'Support & Feedback: juggler.laurence1020@gmail.com',
      65, y - 48, 465, helvetica, 9, 15, colorWhite
    );
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
