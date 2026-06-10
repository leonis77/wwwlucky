// 已知的一次性/临时邮箱域名黑名单
const disposableDomains = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "temp-mail.org",
  "yopmail.com", "throwaway.email", "sharklasers.com", "trashmail.com",
  "guerrillamail.org", "guerrillamail.net", "guerrillamail.biz",
  "mailnesia.com", "tempmail.com", "fakeinbox.com", "emailondeck.com",
  "spamgourmet.com", "mytemp.email", "tempmail.net", "dispostable.com",
  "maildrop.cc", "harakirimail.com", "getnada.com", "tempr.email",
  "discard.email", "spambox.us", "mailcatch.com", "mailexpire.com",
  "spamhole.com", "10minutemail.org", "temporarymail.com",
  "10minutemail.org", "emailfake.com", "tempmailaddress.com",
  "guerrillamailblock.com", "moakt.com", "spambog.com", "spambog.de",
  "spambog.ru", "discardmail.com", "discardmail.de",
  "0wnd.net", "0wnd.org", "10minutemail.co.za", "123-m.com",
  "1zhuan.com", "20minutemail.com", "21cn.com", "33mail.com",
  "3d-painting.com", "4warding.com", "4warding.net", "4warding.org",
  "60minutemail.com", "675hosting.com", "675hosting.net", "675hosting.org",
  "6url.com", "75hosting.com", "75hosting.net", "75hosting.org",
  "7tags.com", "bcaoo.com", "binkmail.com", "bio-muesli.info",
  "bobmail.info", "bofthew.com", "brefmail.com", "bsnow.net",
  "bugmenot.com", "bumpymail.com", "centermail.com", "centermail.net",
  "chogmail.com", "choicemail1.com", "cool.fr.nf", "correo.blogos.net",
  "cosmorph.com", "courriel.fr.nf", "cuvox.de", "dacoolest.com",
  "dandikmail.com", "dayrep.com", "deadaddress.com", "deadspam.com",
  "devnullmail.com", "dfgh.net", "digitalsanctuary.com", "discard-email.com",
  "dodgeit.com", "dontreg.com", "dontsendmespam.de", "dump-email.info",
  "dumpmail.de", "e4ward.com", "email60.com", "emailinfive.com",
  "emailmiser.com", "emailtemporanea.com", "emailtemporanea.net",
  "emailtemporar.ro", "emailthe.net", "emailtmp.com", "etranquil.com",
  "etranquil.net", "etranquil.org", "fakeinformation.com",
  "fastacura.com", "fastchevy.com", "fastchrysler.com", "fastkawasaki.com",
  "fastmazda.com", "fastmitsubishi.com", "fastnissan.com",
  "fastsubaru.com", "fastsuzuki.com", "fasttoyota.com", "fastyamaha.com",
  "filzmail.com", "fivemail.de", "fleckens.hu", "frapmail.com",
  "front14.org", "fux0ringduh.com", "garliclife.com", "getairmail.com",
  "getonemail.com", "getonemail.net", "ghosttexter.de", "girlsundertheinfluence.com",
  "gishpuppy.com", "gowikibooks.com", "gowikicampus.com", "gowikicars.com",
  "gowikifilms.com", "gowikigames.com", "gowikimusic.com",
  "gowikinetwork.com", "gowikitravel.com", "gowikitv.com",
  "greensloth.com", "grr.la", "gustr.com", "h8s.org", "haltospam.com",
  "hidemail.de", "hmamail.com", "ieatspam.eu", "ieatspam.info",
  "ihateyoualot.info", "imails.info", "inbax.tk", "inbox.si",
  "incognitomail.com", "incognitomail.net", "incognitomail.org",
  "insorg-mail.info", "ipoo.org", "irish2me.com", "junk1e.com",
  "kasmail.com", "kaspop.com", "klassmaster.com", "klassmaster.net",
  "klzlk.com", "koszmail.pl", "kurzepost.de", "lawlita.com",
  "lhsdv.com", "link2mail.net", "litedrop.com", "lol.ovpn.to",
  "lookugly.com", "lopl.co.cc", "lortemail.dk", "lr78.com",
  "maboard.com", "mail-filter.com", "mail-temporaire.fr",
  "mail.by", "mail.zp.ua", "mail114.net", "mail1a.de", "mail21.cc",
  "mail2rss.org", "mail333.com", "mail4trash.com", "mailbidon.com",
  "mailbiz.biz", "mailblocks.com", "mailbucket.org", "mailcat.biz",
  "mailde.de", "mailde.info", "maildrop.cc", "maildx.com",
  "maileater.com", "mailed.ro", "mailexpire.com", "mailfa.tk",
  "mailfs.com", "mailguard.me", "mailhazard.com", "mailhazard.us",
  "mailimate.com", "mailin8r.com", "mailinater.com", "mailinator2.com",
  "mailincubator.com", "mailismagic.com", "mailme.ir", "mailme.lv",
  "mailmetrash.com", "mailmoat.com", "mailms.com", "mailnator.com",
  "mailnesia.com", "mailnull.com", "mailpick.biz", "mailsac.com",
  "mailscrap.com", "mailseal.de", "mailshiv.com", "mailslite.com",
  "mailsucker.net", "mailtemp.info", "mailtome.de", "mailtothis.com",
  "mailtrash.net", "mailtv.net", "mailtv.tv", "mailzilla.com",
  "mailzilla.org", "makemetheking.com", "manifestgenerator.com",
  "manybrain.com", "mbx.cc", "mega.zik.dj", "meinspamschutz.de",
  "meltmail.com", "messagebeamer.de", "mezimages.net", "mintemail.com",
  "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf",
  "msa.minsmail.com", "mt2009.com", "mx0.wwwnew.eu", "mycard.net.ua",
  "mypacks.net", "mypartyclip.de", "myphantomemail.com", "mysamp.de",
  "mytempemail.com", "mytempmail.com", "neomailbox.com", "nepwk.com",
  "nervmich.net", "nervtmich.net", "netmails.com", "netmails.net",
  "netzidiot.de", "nincsmail.com", "nincsmail.hu", "nnh.com",
  "noblepioneer.com", "nobulk.com", "noclickemail.com", "nogmailspam.info",
  "nomail.pw", "nomail.xl.cx", "nomorespamemails.com", "nonspam.eu",
  "nonspammer.de", "noref.in", "nospam.ze.tc", "nospam4.us",
  "nospamfor.us", "nospammail.net", "nospamthanks.info",
  "notmailinator.com", "nowmymail.com", "nurfuerspam.de",
  "nus.edu.sg", "nwldx.com", "objectmail.com", "obobbo.com",
  "oneoffemail.com", "onewaymail.com", "online.ms", "oopi.org",
  "opayq.com", "ordinaryamerican.net", "otherinbox.com",
  "ourklips.com", "outlawspam.com", "ovpn.to", "owlpic.com",
  "pancakemail.com", "pimpedup.com", "pjjkp.com", "politikerclub.de",
  "poofy.org", "pookmail.com", "privacy.net", "punkass.com",
  "putthisinyourspam.com", "qq.com-exmail.xyz",
  "quickinbox.com", "rcpt.at", "recode.me", "recursor.net",
  "regbypass.com", "regbypass.comsafe-mail.net", "rejectmail.com",
  "rklips.com", "rmqkr.net", "rppkn.com", "rtrtr.com",
  "s0ny.net", "safe-mail.net", "safersignup.de", "safetymail.info",
  "sandelf.de", "saynotospams.com", "selfdestructingmail.com",
  "sendspamhere.com", "sharklasers.com", "shiftmail.com",
  "shitmail.me", "shitmail.org", "shitware.nl", "shortmail.net",
  "sibmail.com", "skeefmail.com", "slaskpost.se", "slopsbox.com",
  "smellfear.com", "snakemail.com", "sneakemail.com",
  "sneakmail.de", "snkmail.com", "sofimail.com", "sofort-mail.de",
  "sogetthis.com", "soodonims.com", "spam.la", "spam.su",
  "spamavert.com", "spambob.com", "spambob.net", "spambob.org",
  "spambog.com", "spambog.de", "spambog.ru", "spambooger.com",
  "spambox.info", "spambox.irishspringrealty.com", "spambox.us",
  "spamcero.com", "spamcon.org", "spamcorptastic.com", "spamcowboy.com",
  "spamcowboy.net", "spamcowboy.org", "spamday.com", "spamex.com",
  "spamfree.eu", "spamfree24.com", "spamfree24.de", "spamfree24.eu",
  "spamfree24.info", "spamfree24.net", "spamfree24.org",
  "spamgoes.in", "spamgourmet.com", "spamgourmet.net",
  "spamgourmet.org", "spamherelots.com", "spamhereplease.com",
  "spamhole.com", "spamify.com", "spaminator.de", "spamkill.info",
  "spaml.com", "spaml.de", "spammotel.com", "spamobox.com",
  "spamoff.de", "spamsalad.in", "spamslicer.com", "spamspot.com",
  "spamstack.net", "spamthis.co.uk", "spamthisplease.com",
  "spamtrail.com", "spamtroll.net", "speed.1s.fr", "spikio.com",
  "spoofmail.de", "squizzy.de", "ssoia.com", "startkeys.com",
  "stinkefinger.net", "stopmyjunkmail.com", "streetwisemail.com",
  "super-auswahl.de", "supergreatmail.com", "supermailer.jp",
  "superrito.com", "suremail.info", "svk.jp", "sweetxxx.de",
  "tafmail.com", "tagyourself.com", "talkinator.com",
  "teewars.org", "teleworm.com", "teleworm.us", "temp-mail.de",
  "tempail.com", "tempemail.biz", "tempemail.co.za",
  "tempemail.com", "tempemail.net", "tempinbox.co.uk",
  "tempinbox.com", "tempmail.eu", "tempmail.it", "tempmail.pro",
  "tempmail2.com", "tempmaildemo.com", "tempmailer.com",
  "tempmailer.de", "tempomail.fr", "temporarily.de",
  "temporarioemail.com.br", "temporaryemail.us", "temporaryforwarding.com",
  "temporaryinbox.com", "temporarymailaddress.com", "tempthe.net",
  "thankyou2010.com", "thc.st", "thelimestones.com",
  "thisisnotmyrealemail.com", "thismail.net", "throwaway.de",
  "throwawayemailaddress.com", "throwawaymail.com", "tilien.com",
  "tittbit.in", "tizi.com", "tmailinator.com", "toiea.com",
  "toomail.biz", "topranklist.de", "tradermail.info",
  "trash-amil.com", "trash-mail.at", "trash-mail.com",
  "trash-mail.de", "trash2009.com", "trashemail.de",
  "trashmail.at", "trashmail.com", "trashmail.de",
  "trashmail.io", "trashmail.me", "trashmail.net",
  "trashmail.org", "trashmail.ws", "trashmailer.com",
  "trashymail.com", "trashymail.net", "trialmail.de",
  "trillianpro.com", "tryalert.com", "turual.com",
  "twinmail.de", "tyldd.com", "uggsrock.com", "umail.net",
  "upliftnow.com", "uplipht.com", "uroid.com",
  "venompen.com", "veryrealemail.com", "vidchart.com",
  "viralplays.com", "vomoto.com", "vpn.st", "vsimcard.com",
  "vubby.com", "walala.org", "walkmail.net", "walkmail.ru",
  "wasd.dropmail.me", "webm4il.info", "wegwerf-email.de",
  "wegwerf-email.net", "wegwerf-emails.de", "wegwerfadresse.de",
  "wegwerfmail.com", "wegwerfmail.de", "wegwerfmail.net",
  "wegwerfmail.org", "wetrainbayarea.com", "wetrainbayarea.org",
  "wh4f.org", "whyspam.me", "wilemail.com", "willselfdestruct.com",
  "winemaven.info", "wronghead.com", "wuzup.net", "wuzupmail.net",
  "www.e4ward.com", "wwwnew.eu", "xagloo.com", "xemaps.com",
  "xents.com", "xmaily.com", "xoxy.net", "xww.ro",
  "yep.it", "yogamaven.com", "yopmail.fr", "yopmail.net",
  "yopmail.org", "ypmail.webarnak.fr.eu.org", "yuurok.com",
  "zehnminuten.de", "zehnminutenmail.de", "zippymail.info",
  "zoaxe.com", "zoemail.com", "zoemail.net", "zoemail.org",
  "zxcv.com", "zxcvbnm.com",
]);

// 邮箱格式正则
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export interface EmailValidation {
  valid: boolean;
  error: string | null;
}

export function validateEmail(email: string): EmailValidation {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, error: "请输入邮箱地址" };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: "邮箱地址过长" };
  }

  if (!EMAIL_RE.test(trimmed)) {
    return { valid: false, error: "邮箱格式不正确" };
  }

  const domain = trimmed.split("@")[1];
  if (!domain) {
    return { valid: false, error: "邮箱格式不正确" };
  }

  if (disposableDomains.has(domain)) {
    return { valid: false, error: "请使用真实邮箱，临时邮箱不被支持" };
  }

  return { valid: true, error: null };
}

export function sanitizeInput(input: string, maxLength: number = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
}
