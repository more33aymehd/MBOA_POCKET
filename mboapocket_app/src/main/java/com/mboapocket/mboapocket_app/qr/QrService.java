package com.mboapocket.mboapocket_app.qr;

import com.mboapocket.mboapocket_app.qr.dto.QrDecodeRequest;
import com.mboapocket.mboapocket_app.qr.dto.QrDecodeResponse;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class QrService {

    public QrDecodeResponse decode(QrDecodeRequest req) {
        String content = req.getContent() != null ? req.getContent().trim() : "";

        if (content.isEmpty()) {
            throw new IllegalArgumentException("Contenu QR vide");
        }

        // Format Orange Money : OM:237690123456:MarchandName:5000
        if (content.toUpperCase().startsWith("OM:")) {
            return parseOrangeMoney(content);
        }

        // Format MTN MoMo : MTN:237670123456:MarchandName:2500
        if (content.toUpperCase().startsWith("MTN:")) {
            return parseMtnMomo(content);
        }

        // Format URL avec paramètres : https://pay.example.com?merchant=XYZ&amount=3000
        if (content.startsWith("http")) {
            return parseUrl(content);
        }

        // Format numéro de téléphone camerounais : 237690123456 ou 690123456
        if (content.matches("(237)?6[5-9]\\d{7}")) {
            return parsePhoneNumber(content);
        }

        // Numéro marchand simple (6-12 chiffres)
        if (content.matches("\\d{6,12}")) {
            return parseMerchantCode(content);
        }

        // Texte libre — on prend comme nom de marchand
        return QrDecodeResponse.builder()
                .merchant(content)
                .merchantCode(content)
                .method("MOCK")
                .build();
    }

    private QrDecodeResponse parseOrangeMoney(String content) {
        // OM:phone:merchant:amount
        String[] parts = content.split(":", -1);
        String phone = parts.length > 1 ? parts[1] : "";
        String merchant = parts.length > 2 ? parts[2] : "Marchand Orange";
        Integer amount = null;
        if (parts.length > 3) {
            try { amount = Integer.parseInt(parts[3]); } catch (NumberFormatException ignored) {}
        }
        return QrDecodeResponse.builder()
                .merchant(merchant)
                .merchantCode(phone)
                .phoneNumber(phone)
                .suggestedAmount(amount)
                .method("ORANGE_MONEY")
                .build();
    }

    private QrDecodeResponse parseMtnMomo(String content) {
        // MTN:phone:merchant:amount
        String[] parts = content.split(":", -1);
        String phone = parts.length > 1 ? parts[1] : "";
        String merchant = parts.length > 2 ? parts[2] : "Marchand MTN";
        Integer amount = null;
        if (parts.length > 3) {
            try { amount = Integer.parseInt(parts[3]); } catch (NumberFormatException ignored) {}
        }
        return QrDecodeResponse.builder()
                .merchant(merchant)
                .merchantCode(phone)
                .phoneNumber(phone)
                .suggestedAmount(amount)
                .method("MTN_MOMO")
                .build();
    }

    private QrDecodeResponse parseUrl(String url) {
        String merchant = "Marchand";
        Integer amount = null;
        String merchantCode = url;

        // Extraire merchant et amount des query params
        Matcher mMerchant = Pattern.compile("[?&]merchant=([^&]+)").matcher(url);
        if (mMerchant.find()) merchant = mMerchant.group(1).replace("+", " ");

        Matcher mName = Pattern.compile("[?&]name=([^&]+)").matcher(url);
        if (mName.find()) merchant = mName.group(1).replace("+", " ");

        Matcher mAmount = Pattern.compile("[?&]amount=([\\d]+)").matcher(url);
        if (mAmount.find()) {
            try { amount = Integer.parseInt(mAmount.group(1)); } catch (NumberFormatException ignored) {}
        }

        Matcher mCode = Pattern.compile("[?&]code=([^&]+)").matcher(url);
        if (mCode.find()) merchantCode = mCode.group(1);

        return QrDecodeResponse.builder()
                .merchant(merchant)
                .merchantCode(merchantCode)
                .suggestedAmount(amount)
                .method("MOCK")
                .build();
    }

    private QrDecodeResponse parsePhoneNumber(String phone) {
        // Normaliser en format 237XXXXXXXXX
        String normalized = phone.startsWith("237") ? phone : "237" + phone;
        String method = normalized.charAt(3) == '6' && (normalized.charAt(4) == '9' || normalized.charAt(4) == '8')
                ? "ORANGE_MONEY" : "MTN_MOMO";
        return QrDecodeResponse.builder()
                .merchant("Paiement mobile")
                .merchantCode(normalized)
                .phoneNumber(normalized)
                .method(method)
                .build();
    }

    private QrDecodeResponse parseMerchantCode(String code) {
        return QrDecodeResponse.builder()
                .merchant("Marchand #" + code)
                .merchantCode(code)
                .method("MOCK")
                .build();
    }
}
