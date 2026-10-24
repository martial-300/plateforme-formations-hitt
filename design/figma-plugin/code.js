// HIT-T Maquettes — plugin Figma de développement
// À exécuter dans le fichier « Plateforme formations HIT-T — Maquettes MVP ».
// Commandes : charte (couleurs + logo), admin (écrans 07-08), mobile (écrans M1-M3), tout.
// Chaque commande peut être relancée : ce qui existe déjà n'est pas recréé.

const SVG_LOGO = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1080\" height=\"698\" viewBox=\"0 0 1080 698\"><path fill=\"#1A8559\" fill-rule=\"evenodd\" d=\"M516.3 690.2C515.3 689.6 515.3 681.2 516.0 652.7C516.5 632.5 517.2 615.5 517.5 615.0C518.2 613.9 533.1 613.6 536.8 614.6C538.9 615.2 539.0 615.6 539.0 628.5C539.0 640.4 539.2 641.9 540.8 642.4C541.7 642.6 548.1 642.6 555.0 642.2L567.5 641.5L567.2 627.8L566.8 614.1L570.2 613.6C578.7 612.3 587.9 612.2 588.9 613.3C589.4 614.0 591.1 630.9 592.6 650.8C594.9 680.3 595.2 687.3 594.1 687.9C592.4 689.0 572.3 690.3 571.0 689.5C570.4 689.1 570.0 684.3 570.0 678.2C570.0 672.3 569.7 665.8 569.4 663.7L568.7 659.9L554.6 660.2L540.5 660.5L540.0 675.5L539.5 690.5L528.5 690.8C522.5 690.9 517.0 690.6 516.3 690.2ZM464.0 687.6C450.0 683.4 441.8 678.0 437.1 669.7C426.4 650.8 434.7 626.6 455.3 616.9C463.1 613.3 469.9 612.0 480.9 612.0C489.8 612.0 502.6 614.2 504.4 616.0C505.1 616.7 504.7 619.2 503.1 624.0C501.8 627.9 500.5 631.0 500.2 631.0C499.9 631.0 495.9 630.3 491.2 629.4C470.9 625.6 457.5 634.4 457.5 651.5C457.6 666.5 470.0 674.8 491.1 673.8L498.5 673.5L499.9 680.4C501.7 689.9 501.4 690.0 484.6 689.9C474.0 689.9 470.1 689.5 464.0 687.6ZM612.6 682.9C611.7 677.7 606.0 618.6 606.0 614.6C606.0 611.7 606.4 610.9 608.2 610.6C611.0 610.0 627.8 608.0 630.2 608.0C631.9 608.0 643.7 621.9 658.3 641.2C662.1 646.1 665.4 650.0 665.6 649.8C665.8 649.5 664.2 640.8 662.1 630.4C660.0 620.0 658.0 609.7 657.9 607.5L657.5 603.5L666.7 601.9C671.7 601.0 676.3 600.6 676.8 600.9C677.3 601.2 680.3 614.1 683.5 629.5C692.4 673.1 692.4 673.0 691.2 674.2C690.1 675.3 680.5 677.5 671.9 678.5L666.3 679.2L656.4 667.5C647.8 657.4 636.6 643.2 630.7 635.0L628.9 632.5L629.4 638.0C629.7 641.0 631.0 651.3 632.4 660.8C633.9 670.2 635.0 679.3 635.0 680.9C635.0 684.3 634.2 684.6 621.8 685.6L613.1 686.3L612.6 682.9ZM396.0 679.0C366.6 673.6 359.1 672.2 358.0 671.5C357.5 671.2 357.0 669.8 357.0 668.4C357.0 665.7 371.8 598.8 372.6 598.0C372.9 597.8 377.7 598.4 383.3 599.4C388.9 600.4 400.6 602.4 409.2 603.9C417.9 605.4 425.2 606.9 425.6 607.2C426.3 608.0 425.1 620.3 424.1 621.9C423.6 622.7 419.4 622.3 408.5 620.5C400.4 619.1 393.1 618.1 392.4 618.4C390.5 619.1 388.8 628.2 390.3 629.6C391.0 630.2 397.6 631.7 405.0 632.9C412.4 634.2 418.9 635.4 419.3 635.7C420.1 636.2 419.4 645.4 418.4 649.2C417.7 651.5 416.6 651.5 400.5 648.4C393.0 646.9 386.6 646.0 386.3 646.4C385.9 646.7 385.1 649.6 384.4 652.8C383.6 657.0 383.5 658.8 384.4 659.7C385.0 660.3 391.8 661.8 399.5 663.0C407.2 664.1 414.8 665.3 416.4 665.7L419.3 666.2L418.6 673.2C418.3 677.1 417.7 680.6 417.4 681.1C416.6 682.4 413.0 682.1 396.0 679.0ZM722.9 662.5C696.5 654.0 688.3 618.7 708.0 599.0C722.0 585.0 746.6 579.8 762.3 587.5C769.9 591.2 778.1 600.0 781.2 607.7C783.1 612.5 783.5 615.3 783.5 624.0C783.5 633.8 783.3 634.9 780.5 639.8C775.3 649.3 765.6 656.8 753.0 661.2C745.5 663.8 729.1 664.5 722.9 662.5ZM306.5 658.4C302.2 657.1 298.2 655.6 297.7 655.1C296.8 654.2 299.3 645.1 308.7 615.2C311.2 607.4 313.0 600.3 312.7 599.6C312.4 598.8 308.4 597.0 303.8 595.5C299.2 594.0 295.0 592.3 294.4 591.8C293.3 591.0 293.8 587.8 296.7 578.8C297.5 576.2 299.7 576.5 313.9 580.9C320.8 583.1 331.2 586.2 337.0 587.8C342.8 589.4 350.5 591.5 354.2 592.6C361.8 594.7 361.8 594.7 359.6 604.0C358.1 610.7 357.0 611.0 346.6 608.0C342.6 606.8 338.4 606.0 337.4 606.2C335.4 606.5 334.1 610.6 324.3 647.2L320.7 661.0L317.6 660.9C315.9 660.9 310.9 659.8 306.5 658.4ZM749.5 645.1C755.2 642.5 757.9 639.1 759.2 632.8C761.5 621.8 755.2 606.7 746.6 602.6C738.0 598.5 727.0 602.2 723.3 610.4C719.6 618.7 721.6 632.8 727.6 639.8C733.7 646.9 741.5 648.8 749.5 645.1ZM807.3 639.8C806.8 639.1 805.0 634.7 803.3 630.0C801.7 625.3 797.5 613.9 794.1 604.5C781.5 570.1 781.9 571.6 783.8 570.2C786.2 568.3 801.1 562.8 802.4 563.3C803.6 563.8 803.8 564.2 816.0 595.0C820.5 606.3 824.5 615.9 825.0 616.4C825.5 616.9 832.5 614.4 841.2 610.6C849.6 607.0 856.9 604.0 857.3 604.0C858.6 604.0 864.3 616.9 863.7 618.4C863.2 619.8 852.0 624.7 825.8 635.1C810.3 641.4 808.8 641.7 807.3 639.8ZM242.5 612.1C229.3 606.7 224.4 604.5 222.0 602.9L219.6 601.3L221.5 596.9C222.5 594.5 223.7 592.1 224.1 591.6C225.0 590.6 256.0 603.0 256.7 604.6C257.5 606.8 253.3 615.0 251.3 615.0C250.3 614.9 246.3 613.6 242.5 612.1ZM872.7 602.5C863.0 598.9 854.0 589.1 850.5 578.2C847.7 569.8 848.7 557.0 852.8 548.9C858.3 537.8 867.2 530.0 880.2 524.9C887.5 522.0 889.6 521.6 898.1 521.6C906.7 521.6 908.3 521.9 913.6 524.5C920.8 528.0 928.6 535.9 932.5 543.7C935.3 549.0 935.5 550.4 935.5 560.0C935.5 568.8 935.1 571.2 933.3 575.0C927.8 586.0 914.5 596.8 900.8 601.4C892.0 604.4 879.2 604.8 872.7 602.5ZM144.7 590.7C139.4 587.8 134.8 584.9 134.5 584.2C133.9 582.6 135.3 579.8 144.6 564.3C153.9 548.8 161.0 535.5 161.0 533.6C161.0 532.7 157.5 530.0 153.0 527.4C148.6 524.8 144.6 522.2 144.1 521.6C143.0 520.3 149.4 508.4 151.6 507.6C152.3 507.3 156.6 509.4 161.2 512.2C169.8 517.4 195.5 531.7 204.8 536.4C208.4 538.2 210.0 539.6 210.0 541.0C210.0 543.9 204.8 554.0 203.3 554.0C202.5 554.0 197.9 551.9 193.0 549.4C188.0 546.9 183.6 545.1 183.1 545.5C182.2 546.0 179.1 551.7 162.8 582.6C159.6 588.8 156.4 594.2 155.7 594.8C154.8 595.6 151.8 594.5 144.7 590.7ZM904.7 582.2C910.4 578.6 913.5 571.8 912.5 565.1C910.6 551.8 899.7 540.1 889.2 540.0C883.7 540.0 876.3 544.4 873.9 549.2C869.5 557.8 873.6 574.4 881.8 580.6C889.6 586.6 896.9 587.1 904.7 582.2ZM501.8 564.9C443.3 562.5 394.7 556.1 342.0 543.9C315.0 537.7 306.1 535.3 283.0 527.8C253.3 518.1 214.5 502.2 197.8 492.8C194.1 490.7 190.8 489.0 190.5 489.0C189.0 489.0 165.3 474.9 153.0 466.7C85.9 422.1 47.5 370.5 37.9 312.0C36.2 302.3 36.3 275.8 37.9 265.5C45.4 217.5 73.3 173.5 121.5 133.6C145.7 113.6 173.5 96.1 207.0 79.8C294.6 37.4 401.8 13.7 517.0 11.4C583.4 10.0 654.5 16.8 724.0 31.1C877.0 62.7 992.0 131.3 1034.8 216.6C1058.0 262.9 1058.0 314.1 1034.8 360.4C998.7 432.4 908.9 494.3 789.4 529.5C745.0 542.6 691.7 553.3 642.0 559.0C636.8 559.6 629.1 560.5 625.0 561.0C606.3 563.3 553.9 566.1 533.0 565.8C525.6 565.8 511.5 565.4 501.8 564.9ZM90.3 557.7C85.2 554.3 81.0 550.9 81.0 550.2C81.0 548.7 85.0 542.5 100.5 520.0C106.4 511.5 113.5 501.0 116.3 496.8C119.5 491.9 122.2 489.0 123.2 489.0C124.2 489.0 128.6 491.4 133.0 494.2C138.5 497.9 141.0 500.1 141.0 501.5C141.0 502.6 135.7 511.7 129.2 521.6C122.8 531.5 114.0 545.1 109.7 551.8C105.4 558.5 101.3 564.0 100.7 564.0C100.0 563.9 95.3 561.1 90.3 557.7ZM963.9 551.9C956.5 551.1 950.0 547.9 944.4 542.3C939.0 536.8 936.5 532.1 934.5 523.7C931.7 511.6 936.3 497.8 947.1 485.7C955.4 476.4 976.5 462.0 981.8 462.0C983.2 462.0 984.4 463.8 986.3 468.8C987.8 472.5 989.0 475.9 989.0 476.3C989.0 476.8 987.3 477.8 985.3 478.6C974.9 483.0 962.1 493.6 958.9 500.5C952.4 514.4 962.6 530.3 978.0 530.3C986.3 530.3 1000.0 523.3 1000.0 519.1C1000.0 516.7 995.2 510.0 993.4 510.0C992.6 510.0 990.4 511.1 988.6 512.5C986.8 513.9 984.6 515.0 983.8 515.0C982.2 515.0 975.0 505.2 975.0 503.1C975.0 502.6 977.8 500.1 981.3 497.6C984.7 495.2 990.7 490.6 994.5 487.6C998.4 484.5 1002.0 482.0 1002.6 482.0C1004.0 482.0 1007.0 485.4 1015.5 496.5C1018.8 500.8 1023.0 506.1 1024.8 508.2C1026.5 510.4 1028.0 513.2 1028.0 514.3C1028.0 516.9 1009.5 535.4 1002.9 539.3C992.6 545.5 980.2 551.0 975.0 551.8C972.0 552.2 967.0 552.3 963.9 551.9ZM53.2 532.0C48.2 528.1 44.0 524.6 44.0 524.1C44.0 523.6 47.8 518.3 52.5 512.4C57.2 506.4 60.9 501.0 60.8 500.4C60.4 498.9 39.0 482.0 37.5 482.0C36.8 482.0 35.5 483.1 34.7 484.4C33.8 485.7 31.7 488.3 30.0 490.1C28.3 492.0 25.2 495.6 23.2 498.2C21.2 500.9 19.1 503.0 18.5 503.0C17.2 503.0 13.3 500.2 5.7 493.6C-1.2 487.7 -1.5 485.6 3.8 479.7C12.1 470.7 29.9 450.8 38.5 441.2C43.4 435.6 48.2 431.0 49.1 431.0C50.0 431.0 53.6 433.5 57.1 436.6C68.6 446.7 68.4 444.3 58.6 456.0C53.9 461.7 50.0 466.6 50.0 467.0C50.0 468.5 71.3 485.1 72.7 484.8C73.4 484.6 77.3 480.2 81.3 475.0C85.3 469.8 89.2 465.4 90.1 465.2C92.2 464.8 108.0 476.7 108.0 478.7C108.0 479.6 106.6 482.1 104.9 484.4C99.3 491.9 80.9 517.3 73.2 528.2C69.0 534.2 64.9 539.0 64.0 539.0C63.2 539.0 58.3 535.8 53.2 532.0ZM1052.9 481.4C1048.8 476.6 1044.6 471.7 1043.5 470.4C1042.3 469.0 1039.2 467.4 1036.0 466.6C1022.6 463.2 993.4 453.8 992.2 452.6C991.1 451.5 991.9 450.4 997.2 445.9C1000.7 442.9 1004.9 439.3 1006.5 437.8C1008.1 436.2 1010.0 435.0 1010.5 435.0C1011.0 435.0 1017.9 437.8 1025.8 441.1C1033.6 444.5 1040.3 447.0 1040.6 446.7C1041.0 446.4 1039.1 440.1 1036.6 432.8C1034.1 425.5 1032.0 418.4 1032.0 417.0C1032.0 415.2 1034.3 412.2 1040.3 406.2C1044.9 401.7 1049.1 398.0 1049.7 398.0C1050.8 398.0 1054.3 415.0 1057.9 437.9L1059.9 450.2L1066.2 456.9C1069.6 460.5 1074.2 465.2 1076.2 467.2C1078.3 469.3 1080.0 471.9 1080.0 472.9C1080.0 475.1 1064.1 490.0 1061.7 490.0C1060.9 490.0 1056.9 486.1 1052.9 481.4Z\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M339.4 432.7C339.2 432.0 339.1 422.9 339.2 412.5L339.5 393.5L363.2 393.2L387.0 393.0L387.0 286.5C387.0 202.2 386.7 179.8 385.8 179.5C385.1 179.2 374.2 179.3 361.6 179.7L338.6 180.5L338.9 199.0C339.0 210.2 338.7 218.6 338.1 220.3L337.0 223.0L308.3 222.8L279.5 222.5L279.2 180.7L279.0 139.0L420.5 139.0L562.0 139.0L561.8 180.7L561.5 222.5L532.2 222.8C516.2 222.9 503.0 222.7 503.0 222.3C503.0 221.8 502.9 212.3 502.7 201.0L502.5 180.5L478.2 180.2L454.0 180.0L454.0 286.5L454.0 393.0L478.0 393.0L502.0 393.0L502.0 413.5L502.0 434.0L421.0 434.0C356.0 434.0 339.8 433.7 339.4 432.7ZM712.4 432.7C712.2 432.0 712.1 422.9 712.2 412.5L712.5 393.5L736.2 393.2L760.0 393.0L760.0 286.5L760.0 180.0L736.0 180.0L712.0 180.0L711.8 201.2L711.5 222.5L682.0 222.5L652.5 222.5L652.5 181.0L652.5 139.5L793.8 139.2L935.0 139.0L934.8 180.7L934.5 222.5L905.2 222.8L876.0 223.0L876.0 201.5L876.0 180.0L851.5 180.0L827.0 180.0L827.0 286.5L827.0 393.0L851.0 393.0L875.0 393.0L875.0 413.5L875.0 434.0L794.0 434.0C729.0 434.0 712.8 433.7 712.4 432.7ZM543.4 358.7C543.2 358.0 543.1 348.5 543.2 337.5L543.5 317.5L607.0 317.5L670.5 317.5L671.0 336.5C671.3 346.9 671.4 356.5 671.2 357.8L670.9 360.0L607.4 360.0C556.8 360.0 543.8 359.7 543.4 358.7Z\"/><path fill=\"#F5D31B\" fill-rule=\"evenodd\" d=\"M365.2 286.6L365.2 180.1L370.3 179.5C373.2 179.1 378.0 179.0 381.0 179.2L386.5 179.5L386.8 286.2L387.0 393.0L376.1 393.0L365.2 393.0L365.2 286.6Z\"/><path fill=\"#D84416\" fill-rule=\"evenodd\" d=\"M145.2 433.7C143.2 432.8 142.9 432.1 143.2 427.1L143.5 421.5L158.2 421.2L173.0 420.9L173.0 292.1C173.0 221.2 172.7 162.5 172.4 161.6C171.9 160.3 169.8 160.0 159.3 160.0C147.7 160.0 146.6 159.8 144.9 157.8C142.4 155.0 142.5 149.9 145.0 147.2L147.1 145.0L202.6 145.0C248.8 145.1 258.4 145.3 259.6 146.5C261.4 148.3 261.4 156.7 259.6 158.6C258.5 159.7 255.1 160.0 245.2 160.0C234.2 160.0 232.1 160.2 231.6 161.6C230.8 163.7 230.9 274.5 231.6 276.5C232.1 277.8 237.3 278.0 269.5 278.0C304.1 278.0 306.8 277.9 307.5 276.2C307.9 275.3 308.1 262.9 308.0 248.8L307.9 223.1L323.2 222.8L338.5 222.5L338.8 201.2L339.0 179.9L352.1 180.2L365.2 180.5L365.1 285.5C365.1 343.2 365.1 391.1 365.1 391.8C365.0 392.7 361.7 393.0 352.0 393.0L339.0 393.0L339.0 414.0L339.0 435.1L310.9 435.0C292.7 434.9 281.9 434.4 280.3 433.7C278.1 432.7 277.9 432.1 278.2 427.6C278.4 424.8 278.9 422.2 279.5 421.8C280.1 421.4 286.4 421.0 293.6 421.0L306.8 421.0L307.4 417.9C308.2 413.9 308.2 296.7 307.4 294.6C306.9 293.2 302.6 293.0 269.9 293.0L233.0 293.0L232.0 295.6C230.9 298.4 230.6 412.6 231.6 417.9L232.2 421.0L246.6 421.0L261.0 421.0L261.0 427.4C261.0 432.2 260.6 433.9 259.5 434.4C256.5 435.5 147.6 434.9 145.2 433.7Z\"/></svg>";

let V, TS, FP, DESK, MOB;

// ---------------------------------------------------------------- utilitaires

const page = (prefix) => {
  const p = figma.root.children.find((x) => x.name.startsWith(prefix));
  if (!p) throw new Error("Page introuvable : « " + prefix + "… »");
  return p;
};

async function init() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const col = cols.find((c) => c.name === "HIT-T Tokens");
  if (!col) throw new Error("Collection « HIT-T Tokens » introuvable : ouvrez le fichier des maquettes HIT-T.");
  V = {};
  for (const id of col.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    V[v.name] = v;
  }
  TS = {};
  for (const s of await figma.getLocalTextStylesAsync()) TS[s.name] = s;
  for (const w of ["Regular", "Medium", "Semi Bold", "Bold"]) await figma.loadFontAsync({ family: "Inter", style: w });
  FP = page("Fondations");
  DESK = page("Écrans desktop");
  MOB = page("Écrans mobile");
  await FP.loadAsync();
  return col;
}

const fill = (n) => {
  if (!V[n]) throw new Error("Variable introuvable : " + n);
  return [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", V[n])];
};

const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });

async function txt(s, style, color = "color/text/default", weight) {
  const t = figma.createText();
  await t.setTextStyleIdAsync(TS[style].id);
  t.characters = s;
  t.fills = fill(color);
  if (weight) t.fontName = { family: "Inter", style: weight };
  return t;
}

const rad = (n, r) => {
  for (const k of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) n.setBoundVariable(k, V[r]);
};

// Frame auto-layout qui s'ajuste à son contenu
function AL(dir, o = {}) {
  const f = figma.createFrame();
  f.resize(1, 1);
  f.layoutMode = dir;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = [];
  f.clipsContent = false;
  if (o.name) f.name = o.name;
  if (o.itemSpacing != null) f.itemSpacing = o.itemSpacing;
  return f;
}

const padAll = (f, v, h = v) => { f.paddingTop = f.paddingBottom = v; f.paddingLeft = f.paddingRight = h; };

// Largeur fixe, hauteur ajustée au contenu
function setW(f, w) {
  f.resize(w, Math.max(f.height, 1));
  if (f.parent && f.parent.type !== "PAGE" && "layoutMode" in f.parent && f.parent.layoutMode !== "NONE") f.layoutSizingHorizontal = "FIXED";
  if ("layoutMode" in f && f.layoutMode !== "NONE") {
    if (f.layoutMode === "VERTICAL") { f.counterAxisSizingMode = "FIXED"; f.primaryAxisSizingMode = "AUTO"; }
    else { f.primaryAxisSizingMode = "FIXED"; f.counterAxisSizingMode = "AUTO"; }
  }
}

const isMain = (x) => (x.type === "COMPONENT_SET" || (x.type === "COMPONENT" && !(x.parent && x.parent.type === "COMPONENT_SET")));
function comp(name, optional = false) {
  const n = FP.findOne((x) => isMain(x) && x.name === name);
  if (!n && !optional) throw new Error("Composant introuvable : « " + name + " »");
  return n;
}

async function icon(n, size = 16, color) {
  const i = comp("Icône/" + n).createInstance();
  i.resize(size, size);
  if (color) for (const c of i.findAll((x) => "strokes" in x && x.strokes.length)) c.strokes = fill(color);
  return i;
}

const pk = (set, name) => Object.keys(set.componentPropertyDefinitions).find((k) => k.split("#")[0] === name);

function inst(set, variantName, props = {}) {
  const c = set.type === "COMPONENT_SET"
    ? (variantName ? set.children.find((x) => x.name === variantName) : set.defaultVariant)
    : set;
  if (!c) throw new Error("Variante introuvable : " + variantName + " dans " + set.name);
  const i = c.createInstance();
  const p = {};
  for (const [k, v] of Object.entries(props)) { const key = pk(set, k); if (key) p[key] = v; }
  if (Object.keys(p).length) i.setProperties(p);
  return i;
}

async function setBadges(node, dom, typ, words, tagSet) {
  const domSet = comp("Badge domaine"), typSet = comp("Badge type");
  const tags = [];
  for (const n of node.findAll((x) => x.type === "INSTANCE")) {
    const mc = await n.getMainComponentAsync();
    if (!mc || !mc.parent) continue;
    if (dom && mc.parent.id === domSet.id) n.setProperties({ Domaine: dom });
    if (typ && mc.parent.id === typSet.id) n.setProperties({ Type: typ });
    if (tagSet && mc.parent.id === tagSet.id) tags.push(n);
  }
  if (words) tags.forEach((tg, k) => { if (k < words.length) tg.setProperties({ [pk(tagSet, "Mot")]: words[k] }); else tg.visible = false; });
}

const strongVal = (i) => { const t = i.findOne((n) => n.type === "TEXT" && n.name === "Valeur"); if (t) t.fills = fill("color/text/strong"); };

function card(name, p = 24) {
  const c = AL("VERTICAL", { name, itemSpacing: 16 });
  padAll(c, p);
  rad(c, "radius/lg");
  c.fills = fill("color/surface/card");
  c.strokes = fill("color/border/default");
  c.strokeWeight = 1;
  return c;
}

function spacer(parent) { const s = AL("HORIZONTAL", { name: "Espace" }); parent.appendChild(s); s.layoutSizingHorizontal = "FILL"; return s; }

function append(parent, child, h = "FILL") { parent.appendChild(child); if (h) child.layoutSizingHorizontal = h; return child; }

async function para(parent, s, style, color, weight) {
  const t = await txt(s, style, color, weight);
  parent.appendChild(t);
  t.textAutoResize = "HEIGHT";
  t.layoutSizingHorizontal = "FILL";
  return t;
}

function logoNode(h) {
  const f = figma.createNodeFromSvg(SVG_LOGO);
  f.name = "Logo HIT-T";
  f.fills = [];
  f.rescale(h / f.height);
  return f;
}

function rightOf(pageNode, gap = 100) {
  let x = 0;
  for (const c of pageNode.children) x = Math.max(x, c.x + c.width);
  return pageNode.children.length ? x + gap : 0;
}

// Score affiché par une jauge auto-layout : la marge droite « vide » la barre.
function setGauge(instance, score) {
  const track = instance.findOne((n) => n.name === "Jauge");
  if (track && track.layoutMode !== "NONE") track.paddingRight = Math.round(track.width * (1 - score / 0.5));
}

// ---------------------------------------------------------------- 1. charte

async function charte(col) {
  const mode = col.modes[0].modeId;
  const upd = {
    "color/primary/700": "#11633F", "color/primary/600": "#1A8559", "color/primary/100": "#D1EDDF", "color/primary/50": "#ECF7F1",
    "color/accent/600": "#7A5A00", "color/accent/100": "#FEF6C7",
    "color/domaine/sisg": "#B4380F", "color/domaine/sisg-bg": "#FDE8DE",
  };
  for (const [n, h] of Object.entries(upd)) if (V[n]) V[n].setValueForMode(mode, hex(h));
  for (const [n, h] of [["color/marque/vert", "#1A8559"], ["color/marque/orange", "#D84416"], ["color/marque/jaune", "#F5D31B"]]) {
    if (V[n]) continue;
    const v = figma.variables.createVariable(n, col, "COLOR");
    v.setValueForMode(mode, hex(h));
    v.scopes = ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"];
    v.description = "Couleur du logo HIT-T";
    V[n] = v;
  }

  const logo = comp("Logo");
  if (!logo.findOne((n) => n.name === "Logo HIT-T")) {
    const old = logo.findOne((n) => n.name === "Marque");
    logo.insertChild(0, logoNode(40));
    if (old) old.remove();
    logo.itemSpacing = 12;
  }

  if (!comp("Logo complet", true)) {
    const full = figma.createComponent();
    full.name = "Logo complet";
    full.fills = [];
    full.layoutMode = "HORIZONTAL";
    full.primaryAxisSizingMode = "AUTO";
    full.counterAxisSizingMode = "AUTO";
    full.appendChild(logoNode(140));
    full.description = "Logo officiel HIT-T (vectorisé depuis le PNG fourni par le cabinet). Ne pas déformer ; fond blanc ou clair.";
    const sec = FP.findOne((n) => n.type === "FRAME" && n.name === "Logo et navigation");
    if (sec) sec.insertChild(1, full); else FP.appendChild(full);
  }
  return "charte";
}

// ---------------------------------------------------------------- 2. administration

const COLW = { dom: 120, typ: 180, dur: 110, cout: 130, promo: 130, act: 88 };

async function ligneCatalogue() {
  const existing = comp("Ligne catalogue", true);
  if (existing) return existing;
  const domSet = comp("Badge domaine"), typSet = comp("Badge type");
  const board = FP.findOne((n) => n.type === "FRAME" && n.name === "Composants" && n.parent.type === "PAGE");
  const sec = AL("VERTICAL", { name: "Tableau", itemSpacing: 16 });
  sec.appendChild(await txt("Tableau (administration)", "Titre 2", "color/text/strong"));
  if (board) board.appendChild(sec); else FP.appendChild(sec);

  const row = figma.createComponent();
  row.name = "Ligne catalogue";
  row.layoutMode = "HORIZONTAL";
  row.resize(1150, 10);
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.counterAxisAlignItems = "CENTER";
  row.itemSpacing = 16;
  padAll(row, 14, 20);
  row.fills = fill("color/surface/card");
  row.strokes = fill("color/border/default");
  row.strokeWeight = 0;
  row.strokeBottomWeight = 1;
  sec.appendChild(row);

  const cell = (w) => {
    const c = AL("HORIZONTAL", { name: "Cellule", itemSpacing: 4 });
    c.counterAxisAlignItems = "CENTER";
    row.appendChild(c);
    if (w) setW(c, w); else c.layoutSizingHorizontal = "FILL";
    return c;
  };
  const tI = await txt("Office Excel niveau intermédiaire 2010-2024", "Corps fort", "color/text/strong"); tI.name = "Intitulé";
  const cT = cell(); cT.appendChild(tI); tI.textAutoResize = "HEIGHT"; tI.layoutSizingHorizontal = "FILL";
  cell(COLW.dom).appendChild(domSet.defaultVariant.createInstance());
  cell(COLW.typ).appendChild(typSet.defaultVariant.createInstance());
  const tD = await txt("1 semaine", "Corps"); tD.name = "Durée"; cell(COLW.dur).appendChild(tD);
  const tC = await txt("40 500", "Corps"); tC.name = "Coût"; cell(COLW.cout).appendChild(tC);
  const tP = await txt("35 500", "Corps"); tP.name = "Prix promo"; cell(COLW.promo).appendChild(tP);
  const cA = cell(COLW.act);
  for (const [ic, c, n] of [["crayon", "color/text/default", "Modifier"], ["corbeille", "color/danger/600", "Supprimer"]]) {
    const b = AL("HORIZONTAL", { name: n });
    padAll(b, 8);
    rad(b, "radius/sm");
    b.appendChild(await icon(ic, 18, c));
    cA.appendChild(b);
  }
  for (const [n, node] of [["Intitulé", tI], ["Durée", tD], ["Coût", tC], ["Prix promo", tP]]) {
    const k = row.addComponentProperty(n, "TEXT", node.characters);
    node.componentPropertyReferences = { characters: k };
  }
  row.description = "Ligne du tableau de gestion du catalogue (RF-04). Coûts en FCFA ; « — » si pas de prix promo.";
  return row;
}

async function admin() {
  await DESK.loadAsync();
  if (DESK.findOne((n) => n.type === "FRAME" && n.name === "07 · Administration")) return "admin (déjà présent)";
  const row = await ligneCatalogue();
  const S = { btn: comp("Bouton"), field: comp("Champ"), dom: comp("Badge domaine"), typ: comp("Badge type"), chip: comp("Filtre"), nav: comp("Barre de navigation"), kpi: comp("Carte chiffre clé") };
  await figma.setCurrentPageAsync(DESK);

  const sc = figma.createFrame();
  sc.name = "07 · Administration";
  sc.resize(1440, 900);
  sc.x = rightOf(DESK); sc.y = 0;
  sc.layoutMode = "VERTICAL";
  sc.counterAxisSizingMode = "FIXED";
  sc.primaryAxisSizingMode = "AUTO";
  sc.fills = fill("color/surface/page");
  sc.clipsContent = true;

  append(sc, inst(S.nav, "Rôle=Administrateur"));
  const m = AL("VERTICAL", { name: "Corps" }); m.counterAxisAlignItems = "CENTER"; m.paddingTop = 40; m.paddingBottom = 80; append(sc, m);
  const w = AL("VERTICAL", { name: "Contenu", itemSpacing: 32 }); m.appendChild(w); setW(w, 1200);
  const h = AL("VERTICAL", { name: "En-tête", itemSpacing: 6 }); w.appendChild(h);
  h.appendChild(await txt("Tableau de bord", "Display", "color/text/strong"));
  h.appendChild(await txt("Suivi de la plateforme et gestion du catalogue.", "Titre 3", "color/text/muted", "Regular"));

  // Chiffres clés (RF-11)
  const kr = AL("HORIZONTAL", { name: "Chiffres clés", itemSpacing: 24 }); append(w, kr);
  const k1 = inst(S.kpi, null, { "Libellé": "Apprenants inscrits", "Valeur": "27", "Précision": "comptes apprenants créés" });
  append(kr, k1); k1.layoutSizingVertical = "FILL";
  const k2 = inst(S.kpi, null, { "Libellé": "Retours « pertinent »", "Valeur": "74 %", "Précision": "68 sur 92 retours donnés · objectif 70 %" });
  append(kr, k2); k2.layoutSizingVertical = "FILL";
  const k2ic = k2.findOne((n) => n.name === "Pastille");
  if (k2ic) { k2ic.fills = fill("color/success/100"); for (const s of k2ic.findAll((n) => "strokes" in n && n.strokes.length)) s.strokes = fill("color/success/600"); const ic = k2ic.findOne((n) => n.type === "INSTANCE"); if (ic) { const pu = comp("Icône/pouce-haut"); ic.swapComponent(pu); for (const s of ic.findAll((n) => "strokes" in n && n.strokes.length)) s.strokes = fill("color/success/600"); } }

  const top = card("5 formations les plus recommandées"); top.itemSpacing = 14; kr.appendChild(top); setW(top, 520);
  const th = AL("HORIZONTAL", { name: "Titre", itemSpacing: 10 }); th.counterAxisAlignItems = "CENTER";
  th.appendChild(await icon("etincelles", 18, "color/primary/600"));
  th.appendChild(await txt("5 formations les plus recommandées", "Corps fort", "color/text/strong"));
  top.appendChild(th);
  const data = [["Office Excel niveau avancé 2010-2024", 14], ["Développement de site web avec PHP, HTML, CSS", 12], ["Marketing digital", 9], ["Secrétariat-Bureautique (SB)", 8], ["Langage Python et l'IA (Analyse des données)", 7]];
  for (const [n, v] of data) {
    const r = AL("VERTICAL", { name: n, itemSpacing: 4 }); append(top, r);
    const l = AL("HORIZONTAL", { name: "Libellé" }); l.primaryAxisAlignItems = "SPACE_BETWEEN"; append(r, l);
    l.appendChild(await txt(n, "Petit", "color/text/default"));
    l.appendChild(await txt(String(v), "Petit", "color/text/strong", "Semi Bold"));
    const tr = AL("HORIZONTAL", { name: "Barre" }); append(r, tr);
    tr.resize(tr.width, 6); tr.layoutSizingHorizontal = "FILL"; tr.cornerRadius = 3; tr.fills = fill("color/surface/subtle"); tr.clipsContent = true;
    const b = figma.createRectangle(); b.name = "Niveau"; b.cornerRadius = 3; b.fills = fill("color/primary/600"); tr.appendChild(b);
    b.layoutSizingHorizontal = "FILL"; b.layoutSizingVertical = "FILL";
    tr.paddingRight = Math.round(472 * (1 - v / 14));
  }

  // Gestion du catalogue (RF-04)
  const tc = card("Gestion du catalogue", 0); tc.itemSpacing = 0; tc.clipsContent = true; append(w, tc);
  const tb = AL("HORIZONTAL", { name: "Barre d'outils", itemSpacing: 12 }); tb.counterAxisAlignItems = "CENTER"; padAll(tb, 20, 24); append(tc, tb);
  const tt = AL("VERTICAL", { name: "Titre", itemSpacing: 2 });
  tt.appendChild(await txt("Catalogue", "Titre 2", "color/text/strong"));
  tt.appendChild(await txt("86 formations", "Petit", "color/text/muted"));
  tb.appendChild(tt);
  spacer(tb);
  const search = AL("HORIZONTAL", { name: "Recherche", itemSpacing: 8 }); search.counterAxisAlignItems = "CENTER"; padAll(search, 10, 12);
  rad(search, "radius/md"); search.strokes = fill("color/border/strong"); search.strokeWeight = 1; search.fills = fill("color/surface/card");
  search.appendChild(await icon("recherche", 16, "color/text/muted"));
  search.appendChild(await txt("Rechercher une formation…", "Corps", "color/text/muted"));
  tb.appendChild(search); setW(search, 260);
  for (const [o, a] of [["Tous", true], ["SISG", false], ["IA · Data", false], ["TRIT", false]]) tb.appendChild(inst(S.chip, a ? "État=Actif" : "État=Inactif", { "Libellé": o }));
  tb.appendChild(inst(S.btn, "Type=Primaire", { "Libellé": "Ajouter une formation" }));

  const hd = AL("HORIZONTAL", { name: "En-tête tableau", itemSpacing: 16 }); padAll(hd, 10, 20); hd.fills = fill("color/surface/subtle"); append(tc, hd);
  for (const [l, wd] of [["Intitulé", null], ["Domaine", COLW.dom], ["Type", COLW.typ], ["Durée", COLW.dur], ["Coût (FCFA)", COLW.cout], ["Prix promo", COLW.promo], ["Actions", COLW.act]]) {
    const t = await txt(l.toUpperCase(), "Petit", "color/text/muted", "Semi Bold");
    t.letterSpacing = { unit: "PERCENT", value: 4 };
    const c = AL("HORIZONTAL", { name: l }); c.appendChild(t); hd.appendChild(c);
    if (wd) setW(c, wd); else c.layoutSizingHorizontal = "FILL";
  }
  const rows = [
    ["Office Excel niveau intermédiaire 2010-2024", "SISG", "À la carte", "1 semaine", "40 500", "35 500"],
    ["Secrétariat-Bureautique (SB)", "SISG", "Modulaire", "6 mois", "120 000", "—"],
    ["Langage Python et l'IA (Analyse des données)", "IA-Data", "À la carte", "2 jours", "90 500", "80 000"],
    ["Analyste développeur des systèmes IA", "IA-Data", "Modulaire", "6 mois", "250 000", "—"],
    ["Développement de site web avec PHP, HTML, CSS", "TRIT", "À la carte", "3 semaines", "125 000", "120 500"],
    ["Réseau et Cybersécurité", "TRIT", "Modulaire", "9 mois", "380 000", "—"],
  ];
  for (const [t, d, ty, du, co, pr] of rows) {
    const r = inst(row, null, { "Intitulé": t, "Durée": du, "Coût": co, "Prix promo": pr });
    append(tc, r);
    await setBadges(r, d, ty);
  }
  const pg = AL("HORIZONTAL", { name: "Pied", itemSpacing: 8 }); pg.counterAxisAlignItems = "CENTER"; padAll(pg, 16, 24); append(tc, pg);
  pg.appendChild(await txt("Affichage de 6 sur 86", "Petit", "color/text/muted"));
  spacer(pg);
  pg.appendChild(inst(S.btn, "Type=Secondaire", { "Libellé": "Précédent" }));
  pg.appendChild(inst(S.btn, "Type=Secondaire", { "Libellé": "Suivant" }));

  // 08 · Modale de modification
  const sm = sc.clone();
  sm.name = "08 · Administration · Modifier une formation";
  sm.x = sc.x + 1540;
  const ov = figma.createFrame();
  ov.name = "Fond modale";
  sm.appendChild(ov);
  ov.layoutPositioning = "ABSOLUTE";
  ov.x = 0; ov.y = 0;
  ov.resize(1440, sm.height);
  ov.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.09, b: 0.16 }, opacity: 0.5 }];
  ov.layoutMode = "VERTICAL";
  ov.primaryAxisSizingMode = "FIXED"; ov.counterAxisSizingMode = "FIXED";
  ov.counterAxisAlignItems = "CENTER";
  ov.paddingTop = 64;
  const md = card("Modale formation", 32); md.itemSpacing = 20; ov.appendChild(md); setW(md, 680);
  md.effects = [{ type: "DROP_SHADOW", color: { r: 0.06, g: 0.09, b: 0.16, a: 0.2 }, offset: { x: 0, y: 16 }, radius: 40, spread: 0, visible: true, blendMode: "NORMAL" }];
  const mh = AL("VERTICAL", { name: "En-tête", itemSpacing: 4 }); append(md, mh);
  mh.appendChild(await txt("Modifier une formation", "Titre 1", "color/text/strong"));
  await para(mh, "Les modifications sont prises en compte dès la prochaine soumission d'un questionnaire.", "Corps", "color/text/muted");
  const fld = (parent, v, props) => { const f = inst(S.field, v, props); append(parent, f); strongVal(f); return f; };
  const line = () => { const r = AL("HORIZONTAL", { name: "Ligne", itemSpacing: 16 }); append(md, r); return r; };
  fld(md, "Type=Texte", { "Libellé": "Intitulé", "Valeur": "Office Excel niveau intermédiaire 2010-2024" });
  fld(md, "Type=Zone de texte", { "Libellé": "Description", "Valeur": "Maîtriser les fonctions courantes, tris, filtres, graphiques et mises en forme conditionnelles pour analyser des données." });
  let r = line(); fld(r, "Type=Liste", { "Libellé": "Domaine", "Valeur": "SISG — Secrétariat et Gestion" }); fld(r, "Type=Liste", { "Libellé": "Type", "Valeur": "À la carte" });
  r = line(); fld(r, "Type=Texte", { "Libellé": "Durée", "Valeur": "1" }); fld(r, "Type=Liste", { "Libellé": "Unité", "Valeur": "semaine" });
  r = line(); fld(r, "Type=Texte", { "Libellé": "Coût (FCFA)", "Valeur": "40 500" }); fld(r, "Type=Texte", { "Libellé": "Prix promo (FCFA)", "Valeur": "35 500", "Aide": "Laisser vide si aucun (formations modulaires).", "Afficher l'aide": true });
  fld(md, "Type=Zone de texte", { "Libellé": "Mots-clés", "Valeur": "excel, tableur, fonctions, graphiques, filtres, analyse de données, gestion, comptabilité", "Aide": "Séparés par des virgules. Ils servent directement au calcul des recommandations.", "Afficher l'aide": true });
  const ma = AL("HORIZONTAL", { name: "Actions", itemSpacing: 12 }); append(md, ma);
  ma.appendChild(inst(S.btn, "Type=Danger", { "Libellé": "Supprimer" }));
  spacer(ma);
  ma.appendChild(inst(S.btn, "Type=Secondaire", { "Libellé": "Annuler" }));
  ma.appendChild(inst(S.btn, "Type=Primaire", { "Libellé": "Enregistrer" }));

  figma.viewport.scrollAndZoomIntoView([sc, sm]);
  return "admin";
}

// ---------------------------------------------------------------- 3. mobile

async function fbBtn(label, ic, state) {
  const b = AL("HORIZONTAL", { name: label, itemSpacing: 6 });
  b.counterAxisAlignItems = "CENTER"; b.primaryAxisAlignItems = "CENTER";
  padAll(b, 10, 12); rad(b, "radius/md"); b.strokeWeight = 1;
  const fg = state === "pertinent" ? "color/success/600" : state === "non" ? "color/danger/600" : "color/text/default";
  b.fills = state === "pertinent" ? fill("color/success/100") : state === "non" ? fill("color/danger/100") : fill("color/surface/card");
  b.strokes = state === "pertinent" ? fill("color/success/600") : state === "non" ? fill("color/danger/600") : fill("color/border/strong");
  b.appendChild(await icon(ic, 16, fg));
  b.appendChild(await txt(label, "Libellé", fg));
  return b;
}

async function recoMobile() {
  const existing = comp("Carte recommandation mobile", true);
  if (existing) return existing;
  const domSet = comp("Badge domaine"), typSet = comp("Badge type"), tagSet = comp("Mot-clé");
  const board = FP.findOne((n) => n.type === "FRAME" && n.name === "Composants" && n.parent.type === "PAGE");
  const sec = AL("VERTICAL", { name: "Mobile", itemSpacing: 16 });
  sec.appendChild(await txt("Mobile", "Titre 2", "color/text/strong"));
  if (board) board.appendChild(sec); else FP.appendChild(sec);
  const variants = [];
  for (const retour of ["Aucun", "Pertinent", "Non pertinent"]) {
    const r = figma.createComponent();
    r.name = "Retour=" + retour;
    r.layoutMode = "VERTICAL";
    r.resize(358, 10);
    r.counterAxisSizingMode = "FIXED"; r.primaryAxisSizingMode = "AUTO";
    r.itemSpacing = 12; padAll(r, 16);
    rad(r, "radius/lg"); r.fills = fill("color/surface/card"); r.strokes = fill("color/border/default"); r.strokeWeight = 1;
    sec.appendChild(r);
    const top = AL("HORIZONTAL", { name: "En-tête", itemSpacing: 8 }); top.counterAxisAlignItems = "CENTER"; append(r, top);
    const rank = AL("HORIZONTAL", { name: "Rang" }); rank.primaryAxisAlignItems = "CENTER"; rank.counterAxisAlignItems = "CENTER";
    rank.resize(32, 32); rank.primaryAxisSizingMode = "FIXED"; rank.counterAxisSizingMode = "FIXED"; rad(rank, "radius/full"); rank.fills = fill("color/primary/50");
    const rt = await txt("1", "Corps fort", "color/primary/700", "Bold"); rt.name = "Rang"; rank.appendChild(rt); top.appendChild(rank);
    top.appendChild(domSet.defaultVariant.createInstance());
    top.appendChild(typSet.defaultVariant.createInstance());
    const t = await para(r, "Développement de site web avec PHP, HTML, CSS", "Titre 3", "color/text/strong"); t.name = "Intitulé";
    const d = await para(r, "Créer des sites web dynamiques avec HTML, CSS et PHP.", "Corps", "color/text/muted"); d.name = "Description";
    const why = AL("VERTICAL", { name: "Pourquoi", itemSpacing: 6 }); append(r, why);
    const wl = AL("HORIZONTAL", { name: "Titre", itemSpacing: 6 }); wl.counterAxisAlignItems = "CENTER";
    wl.appendChild(await icon("etincelles", 14, "color/primary/600"));
    wl.appendChild(await txt("Correspond à votre profil :", "Petit", "color/primary/700", "Semi Bold"));
    why.appendChild(wl);
    const tags = AL("HORIZONTAL", { name: "Mots-clés", itemSpacing: 6 }); tags.layoutWrap = "WRAP"; tags.counterAxisSpacing = 6; append(why, tags);
    for (const w of ["développement web", "site web", "programmation"]) tags.appendChild(inst(tagSet, "Correspondance=Oui", { "Mot": w }));
    const meta = AL("HORIZONTAL", { name: "Infos", itemSpacing: 16 }); meta.counterAxisAlignItems = "CENTER"; append(r, meta);
    for (const [ic, val, nm] of [["horloge", "3 semaines", "Durée"], ["argent", "120 500 FCFA (promo)", "Prix"]]) {
      const m = AL("HORIZONTAL", { name: nm, itemSpacing: 6 }); m.counterAxisAlignItems = "CENTER";
      m.appendChild(await icon(ic, 16, "color/text/muted"));
      const tx = await txt(val, "Corps", "color/text/default"); tx.name = nm; m.appendChild(tx);
      meta.appendChild(m);
    }
    const sc = AL("VERTICAL", { name: "Score", itemSpacing: 6 }); append(r, sc);
    const sh = AL("HORIZONTAL", { name: "Ligne" }); sh.primaryAxisAlignItems = "SPACE_BETWEEN"; sh.counterAxisAlignItems = "CENTER"; append(sc, sh);
    sh.appendChild(await txt("Score de pertinence", "Petit", "color/text/muted"));
    const sv = await txt("0,42", "Corps fort", "color/text/strong", "Bold"); sv.name = "Score"; sh.appendChild(sv);
    const track = AL("HORIZONTAL", { name: "Jauge" }); append(sc, track);
    track.resize(track.width, 6); track.layoutSizingHorizontal = "FILL"; rad(track, "radius/full"); track.fills = fill("color/surface/subtle"); track.clipsContent = true; track.paddingRight = 80;
    const lvl = figma.createRectangle(); lvl.name = "Niveau"; lvl.cornerRadius = 3; lvl.fills = fill("color/primary/600"); track.appendChild(lvl);
    lvl.layoutSizingHorizontal = "FILL"; lvl.layoutSizingVertical = "FILL";
    const fb = AL("VERTICAL", { name: "Retour", itemSpacing: 8 }); append(r, fb);
    fb.appendChild(await txt(retour === "Aucun" ? "Cette formation vous convient ?" : "Merci pour votre retour", "Petit", "color/text/muted"));
    const row = AL("HORIZONTAL", { name: "Boutons", itemSpacing: 8 }); append(fb, row);
    const b1 = await fbBtn("Pertinente", "pouce-haut", retour === "Pertinent" ? "pertinent" : "neutre");
    const b2 = await fbBtn("Pas pour moi", "pouce-bas", retour === "Non pertinent" ? "non" : "neutre");
    append(row, b1); append(row, b2);
    if (retour === "Pertinent") b2.opacity = 0.5;
    if (retour === "Non pertinent") b1.opacity = 0.5;
    variants.push(r);
  }
  const set = figma.combineAsVariants(variants, sec);
  set.name = "Carte recommandation mobile";
  set.layoutMode = "HORIZONTAL"; set.itemSpacing = 16; set.primaryAxisSizingMode = "AUTO"; set.counterAxisSizingMode = "AUTO"; set.counterAxisAlignItems = "MIN"; set.fills = [];
  const props = { "Rang": "1", "Intitulé": "Développement de site web avec PHP, HTML, CSS", "Description": "Créer des sites web dynamiques avec HTML, CSS et PHP.", "Durée": "3 semaines", "Prix": "120 500 FCFA (promo)", "Score": "0,42" };
  for (const [k, val] of Object.entries(props)) {
    const key = set.addComponentProperty(k, "TEXT", val);
    for (const v of set.children) { const n = v.findOne((x) => x.type === "TEXT" && x.name === k); if (n) n.componentPropertyReferences = { characters: key }; }
  }
  set.description = "Recommandation sur mobile (RF-08 à RF-10). Jauge : marge droite de « Jauge » = largeur × (1 − score / 0,5).";
  return set;
}

async function mobileHeader(sc, logoComp) {
  const h = AL("HORIZONTAL", { name: "En-tête mobile" });
  h.primaryAxisAlignItems = "SPACE_BETWEEN"; h.counterAxisAlignItems = "CENTER"; padAll(h, 12, 16);
  h.fills = fill("color/surface/card"); h.strokes = fill("color/border/default"); h.strokeWeight = 0; h.strokeBottomWeight = 1;
  append(sc, h);
  h.appendChild(logoComp.createInstance());
  const m = AL("HORIZONTAL", { name: "Menu" }); padAll(m, 8); m.appendChild(await icon("menu", 24, "color/text/strong")); h.appendChild(m);
  return h;
}

function mobileScreen(name, x) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(390, 844);
  f.x = x; f.y = 0;
  f.layoutMode = "VERTICAL";
  f.counterAxisSizingMode = "FIXED"; f.primaryAxisSizingMode = "AUTO";
  f.fills = fill("color/surface/page");
  f.clipsContent = true;
  return f;
}

function mobileBody(sc, gap = 16) {
  const b = AL("VERTICAL", { name: "Corps", itemSpacing: gap }); padAll(b, 20, 16); b.paddingBottom = 32; append(sc, b);
  return b;
}

async function mobile() {
  await MOB.loadAsync();
  if (MOB.findOne((n) => n.type === "FRAME" && n.name.startsWith("M1 ·"))) return "mobile (déjà présent)";
  const reco = await recoMobile();
  const S = { btn: comp("Bouton"), field: comp("Champ"), chip: comp("Filtre"), fcard: comp("Carte formation"), tag: comp("Mot-clé"), logo: comp("Logo") };
  await figma.setCurrentPageAsync(MOB);
  const x0 = rightOf(MOB);

  // M1 · Catalogue
  const m1 = mobileScreen("M1 · Catalogue", x0);
  await mobileHeader(m1, S.logo);
  const b1 = mobileBody(m1);
  const hd = AL("VERTICAL", { name: "Titre", itemSpacing: 4 }); append(b1, hd);
  await para(hd, "Catalogue des formations", "Titre 1", "color/text/strong");
  await para(hd, "86 formations en SISG, IA & Data, TRIT.", "Corps", "color/text/muted");
  const cta = AL("VERTICAL", { name: "Appel recommandations", itemSpacing: 12 }); padAll(cta, 16); rad(cta, "radius/lg");
  cta.fills = fill("color/primary/50"); cta.strokes = fill("color/primary/100"); cta.strokeWeight = 1; append(b1, cta);
  const ctaT = AL("HORIZONTAL", { name: "Texte", itemSpacing: 10 }); ctaT.counterAxisAlignItems = "CENTER"; append(cta, ctaT);
  ctaT.appendChild(await icon("etincelles", 20, "color/primary/600"));
  await para(ctaT, "Vous hésitez ? Obtenez 5 formations adaptées à votre profil.", "Corps fort", "color/text/strong");
  append(cta, inst(S.btn, "Type=Primaire", { "Libellé": "Commencer" }));
  for (const [label, opts] of [["Domaine", ["Tous", "SISG", "IA · Data", "TRIT"]], ["Type", ["Tous", "À la carte", "Modulaire"]]]) {
    const g = AL("VERTICAL", { name: "Filtre " + label, itemSpacing: 8 }); append(b1, g);
    g.appendChild(await txt(label, "Libellé", "color/text/muted"));
    const r = AL("HORIZONTAL", { name: "Options", itemSpacing: 8 }); r.layoutWrap = "WRAP"; r.counterAxisSpacing = 8; append(g, r);
    opts.forEach((o, i) => r.appendChild(inst(S.chip, i === 0 ? "État=Actif" : "État=Inactif", { "Libellé": o })));
  }
  const cards = [
    ["Office Excel niveau intermédiaire 2010-2024", "Maîtriser les fonctions courantes, tris, filtres, graphiques et mises en forme conditionnelles pour analyser des données.", "SISG", "À la carte", "1 semaine", "40 500 FCFA", "35 500 FCFA", true],
    ["Langage Python et l'IA (Analyse des données)", "Programmer en Python pour analyser des données et préparer des projets d'IA (20 h).", "IA-Data", "À la carte", "2 jours", "90 500 FCFA", "80 000 FCFA", true],
    ["Réseau et Cybersécurité", "Administrer des réseaux d'entreprise et mettre en place leur sécurité.", "TRIT", "Modulaire", "9 mois", "380 000 FCFA", "380 000 FCFA", false],
  ];
  for (const [t, d, dom, typ, dur, p, pp, promo] of cards) {
    const c = inst(S.fcard, null, { "Intitulé": t, "Description": d, "Durée": dur, "Prix": p, "Prix promo": pp, "Prix barré (promo)": promo });
    append(b1, c);
    await setBadges(c, dom, typ);
  }
  append(b1, inst(S.btn, "Type=Secondaire", { "Libellé": "Afficher plus de formations" }));

  // M2 · Questionnaire
  const m2 = mobileScreen("M2 · Questionnaire", x0 + 490);
  await mobileHeader(m2, S.logo);
  const b2 = mobileBody(m2, 20);
  const h2 = AL("VERTICAL", { name: "Titre", itemSpacing: 4 }); append(b2, h2);
  await para(h2, "Parlez-nous de vous", "Titre 1", "color/text/strong");
  await para(h2, "6 questions, environ 2 minutes.", "Corps", "color/text/muted");
  const fld = (v, props) => { const f = inst(S.field, v, props); append(b2, f); strongVal(f); return f; };
  fld("Type=Liste", { "Libellé": "1. Niveau d'études", "Valeur": "BAC II" });
  fld("Type=Texte", { "Libellé": "2. Objectif professionnel", "Valeur": "Devenir développeur web" });
  fld("Type=Zone de texte", { "Libellé": "3. Vos compétences actuelles", "Valeur": "Word, Excel, bases d'Internet", "Aide": "Séparez par des virgules.", "Afficher l'aide": true });
  fld("Type=Zone de texte", { "Libellé": "4. Vos centres d'intérêt", "Valeur": "Programmation, développement web, sites internet" });
  const tq = AL("VERTICAL", { name: "5. Type souhaité", itemSpacing: 8 }); append(b2, tq);
  tq.appendChild(await txt("5. Type de formation souhaité", "Libellé", "color/text/strong"));
  for (const [title, desc, sel] of [["Formation courte, à la carte", "De 1 jour à 3 mois : un outil ou une compétence précise.", true], ["Parcours modulaire certifiant", "De 2 à 9 mois : un métier complet.", false]]) {
    const o = AL("HORIZONTAL", { name: "Option · " + title, itemSpacing: 12 }); padAll(o, 14); rad(o, "radius/md");
    o.fills = sel ? fill("color/primary/50") : fill("color/surface/card"); o.strokes = sel ? fill("color/primary/600") : fill("color/border/strong"); o.strokeWeight = sel ? 2 : 1;
    append(tq, o);
    const radio = figma.createEllipse(); radio.name = "Radio"; radio.resize(18, 18); radio.fills = fill("color/surface/card");
    radio.strokes = sel ? fill("color/primary/600") : fill("color/border/strong"); radio.strokeWeight = sel ? 5 : 1.5; radio.strokeAlign = "INSIDE";
    o.appendChild(radio);
    const t = AL("VERTICAL", { name: "Texte", itemSpacing: 2 }); append(o, t);
    await para(t, title, "Corps fort", "color/text/strong");
    await para(t, desc, "Petit", "color/text/muted");
  }
  fld("Type=Texte", { "Libellé": "6. Budget maximum", "Valeur": "150 000 FCFA", "Aide": "Seules les formations à ce prix ou moins vous seront proposées.", "Afficher l'aide": true });
  const bar = AL("VERTICAL", { name: "Barre d'action", itemSpacing: 8 }); padAll(bar, 16); bar.fills = fill("color/surface/card");
  bar.strokes = fill("color/border/default"); bar.strokeWeight = 0; bar.strokeTopWeight = 1; append(m2, bar);
  append(bar, inst(S.btn, "Type=Primaire", { "Libellé": "Voir mes recommandations" }));
  const note = await para(bar, "Toutes les questions sont obligatoires.", "Petit", "color/text/muted"); note.textAlignHorizontal = "CENTER";

  // M3 · Mes recommandations
  const m3 = mobileScreen("M3 · Mes recommandations", x0 + 980);
  await mobileHeader(m3, S.logo);
  const b3 = mobileBody(m3);
  const h3 = AL("VERTICAL", { name: "Titre", itemSpacing: 4 }); append(b3, h3);
  await para(h3, "Vos 5 formations recommandées", "Titre 1", "color/text/strong");
  await para(h3, "Classées de la plus à la moins pertinente.", "Corps", "color/text/muted");
  const prof = AL("HORIZONTAL", { name: "Résumé profil", itemSpacing: 8 }); prof.counterAxisAlignItems = "CENTER"; padAll(prof, 12, 14); rad(prof, "radius/md");
  prof.fills = fill("color/surface/card"); prof.strokes = fill("color/border/default"); prof.strokeWeight = 1; append(b3, prof);
  const pt = AL("VERTICAL", { name: "Texte", itemSpacing: 2 }); append(prof, pt);
  await para(pt, "À la carte · budget ≤ 150 000 FCFA", "Corps fort", "color/text/strong");
  await para(pt, "Objectif : devenir développeur web", "Petit", "color/text/muted");
  prof.appendChild(inst(S.btn, "Type=Fantôme", { "Libellé": "Modifier" }));
  const recos = [
    ["Développement de site web avec PHP, HTML, CSS", "Créer des sites web dynamiques avec HTML, CSS et PHP.", "TRIT", "3 semaines", "120 500 FCFA (promo)", "0,48", ["développement web", "site web", "programmation"], "Retour=Pertinent"],
    ["IA et le développement web", "Intégrer des fonctionnalités d'intelligence artificielle dans des sites et applications web.", "IA-Data", "1 mois", "90 000 FCFA (promo)", "0,41", ["développement web", "programmation", "applications web"], "Retour=Aucun"],
    ["Développement web Laravel (ou autres technologies)", "Développer des applications web structurées avec le framework Laravel.", "TRIT", "3 semaines", "135 000 FCFA (promo)", "0,36", ["développement web", "programmation"], "Retour=Aucun"],
    ["Programmation en Java SE ou C++ ou VB ou PHP", "Apprendre un langage de programmation et réaliser ses premières applications.", "TRIT", "3 semaines", "120 500 FCFA (promo)", "0,29", ["programmation", "développement"], "Retour=Non pertinent"],
    ["Algorithme et Programmation avec C/C++, Java", "Apprendre la logique algorithmique et programmer en C, C++ ou Java.", "TRIT", "3 semaines", "82 500 FCFA (promo)", "0,22", ["programmation"], "Retour=Aucun"],
  ];
  let rank = 1;
  for (const [t, d, dom, dur, prix, score, words, ret] of recos) {
    const i = inst(reco, ret, { "Rang": String(rank++), "Intitulé": t, "Description": d, "Durée": dur, "Prix": prix, "Score": score });
    append(b3, i);
    await setBadges(i, dom, null, words, S.tag);
    setGauge(i, parseFloat(score.replace(",", ".")));
  }

  figma.viewport.scrollAndZoomIntoView([m1, m2, m3]);
  return "mobile";
}

// ---------------------------------------------------------------- lancement

(async () => {
  const cmd = figma.command || "tout";
  let msg;
  try {
    const col = await init();
    const done = [];
    if (cmd === "charte" || cmd === "tout") done.push(await charte(col));
    if (cmd === "admin" || cmd === "tout") done.push(await admin());
    if (cmd === "mobile" || cmd === "tout") done.push(await mobile());
    msg = "HIT-T : terminé — " + done.join(", ");
  } catch (e) {
    console.error(e);
    msg = "HIT-T : erreur — " + e.message;
  }
  // Lancé depuis le menu Plugins : on ferme le plugin. Sous Scripter : simple notification.
  if (figma.command) figma.closePlugin(msg);
  else figma.notify(msg, { timeout: 10000 });
})();
