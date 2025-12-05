import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, Lock, Bell, Globe, Moon, Download, 
  Upload, Info, LogOut, ChevronRight, Loader2, Coins
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import logo from "@/assets/mtsango-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// All world currencies
const CURRENCIES = [
  { code: "KMF", name: "Franc comorien", symbol: "FC" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "USD", name: "Dollar américain", symbol: "$" },
  { code: "GBP", name: "Livre sterling", symbol: "£" },
  { code: "CHF", name: "Franc suisse", symbol: "CHF" },
  { code: "CAD", name: "Dollar canadien", symbol: "C$" },
  { code: "AUD", name: "Dollar australien", symbol: "A$" },
  { code: "JPY", name: "Yen japonais", symbol: "¥" },
  { code: "CNY", name: "Yuan chinois", symbol: "¥" },
  { code: "INR", name: "Roupie indienne", symbol: "₹" },
  { code: "AED", name: "Dirham des EAU", symbol: "د.إ" },
  { code: "AFN", name: "Afghani afghan", symbol: "؋" },
  { code: "ALL", name: "Lek albanais", symbol: "L" },
  { code: "AMD", name: "Dram arménien", symbol: "֏" },
  { code: "AOA", name: "Kwanza angolais", symbol: "Kz" },
  { code: "ARS", name: "Peso argentin", symbol: "$" },
  { code: "AZN", name: "Manat azerbaïdjanais", symbol: "₼" },
  { code: "BAM", name: "Mark convertible", symbol: "KM" },
  { code: "BBD", name: "Dollar barbadien", symbol: "$" },
  { code: "BDT", name: "Taka bangladais", symbol: "৳" },
  { code: "BGN", name: "Lev bulgare", symbol: "лв" },
  { code: "BHD", name: "Dinar bahreïni", symbol: ".د.ب" },
  { code: "BIF", name: "Franc burundais", symbol: "FBu" },
  { code: "BND", name: "Dollar de Brunei", symbol: "$" },
  { code: "BOB", name: "Boliviano bolivien", symbol: "Bs." },
  { code: "BRL", name: "Réal brésilien", symbol: "R$" },
  { code: "BSD", name: "Dollar bahaméen", symbol: "$" },
  { code: "BTN", name: "Ngultrum bhoutanais", symbol: "Nu." },
  { code: "BWP", name: "Pula botswanais", symbol: "P" },
  { code: "BYN", name: "Rouble biélorusse", symbol: "Br" },
  { code: "BZD", name: "Dollar bélizien", symbol: "$" },
  { code: "CDF", name: "Franc congolais", symbol: "FC" },
  { code: "CLP", name: "Peso chilien", symbol: "$" },
  { code: "COP", name: "Peso colombien", symbol: "$" },
  { code: "CRC", name: "Colón costaricain", symbol: "₡" },
  { code: "CUP", name: "Peso cubain", symbol: "$" },
  { code: "CVE", name: "Escudo cap-verdien", symbol: "$" },
  { code: "CZK", name: "Couronne tchèque", symbol: "Kč" },
  { code: "DJF", name: "Franc djiboutien", symbol: "Fdj" },
  { code: "DKK", name: "Couronne danoise", symbol: "kr" },
  { code: "DOP", name: "Peso dominicain", symbol: "$" },
  { code: "DZD", name: "Dinar algérien", symbol: "د.ج" },
  { code: "EGP", name: "Livre égyptienne", symbol: "£" },
  { code: "ERN", name: "Nakfa érythréen", symbol: "Nfk" },
  { code: "ETB", name: "Birr éthiopien", symbol: "Br" },
  { code: "FJD", name: "Dollar fidjien", symbol: "$" },
  { code: "GEL", name: "Lari géorgien", symbol: "₾" },
  { code: "GHS", name: "Cedi ghanéen", symbol: "₵" },
  { code: "GMD", name: "Dalasi gambien", symbol: "D" },
  { code: "GNF", name: "Franc guinéen", symbol: "FG" },
  { code: "GTQ", name: "Quetzal guatémaltèque", symbol: "Q" },
  { code: "GYD", name: "Dollar guyanien", symbol: "$" },
  { code: "HKD", name: "Dollar de Hong Kong", symbol: "HK$" },
  { code: "HNL", name: "Lempira hondurien", symbol: "L" },
  { code: "HRK", name: "Kuna croate", symbol: "kn" },
  { code: "HTG", name: "Gourde haïtienne", symbol: "G" },
  { code: "HUF", name: "Forint hongrois", symbol: "Ft" },
  { code: "IDR", name: "Roupie indonésienne", symbol: "Rp" },
  { code: "ILS", name: "Shekel israélien", symbol: "₪" },
  { code: "IQD", name: "Dinar irakien", symbol: "ع.د" },
  { code: "IRR", name: "Rial iranien", symbol: "﷼" },
  { code: "ISK", name: "Couronne islandaise", symbol: "kr" },
  { code: "JMD", name: "Dollar jamaïcain", symbol: "$" },
  { code: "JOD", name: "Dinar jordanien", symbol: "د.ا" },
  { code: "KES", name: "Shilling kényan", symbol: "KSh" },
  { code: "KGS", name: "Som kirghize", symbol: "лв" },
  { code: "KHR", name: "Riel cambodgien", symbol: "៛" },
  { code: "KPW", name: "Won nord-coréen", symbol: "₩" },
  { code: "KRW", name: "Won sud-coréen", symbol: "₩" },
  { code: "KWD", name: "Dinar koweïtien", symbol: "د.ك" },
  { code: "KYD", name: "Dollar des îles Caïmans", symbol: "$" },
  { code: "KZT", name: "Tenge kazakh", symbol: "₸" },
  { code: "LAK", name: "Kip laotien", symbol: "₭" },
  { code: "LBP", name: "Livre libanaise", symbol: "ل.ل" },
  { code: "LKR", name: "Roupie srilankaise", symbol: "Rs" },
  { code: "LRD", name: "Dollar libérien", symbol: "$" },
  { code: "LSL", name: "Loti lesothan", symbol: "L" },
  { code: "LYD", name: "Dinar libyen", symbol: "ل.د" },
  { code: "MAD", name: "Dirham marocain", symbol: "د.م." },
  { code: "MDL", name: "Leu moldave", symbol: "L" },
  { code: "MGA", name: "Ariary malgache", symbol: "Ar" },
  { code: "MKD", name: "Denar macédonien", symbol: "ден" },
  { code: "MMK", name: "Kyat birman", symbol: "K" },
  { code: "MNT", name: "Tugrik mongol", symbol: "₮" },
  { code: "MOP", name: "Pataca macanaise", symbol: "P" },
  { code: "MRU", name: "Ouguiya mauritanien", symbol: "UM" },
  { code: "MUR", name: "Roupie mauricienne", symbol: "₨" },
  { code: "MVR", name: "Rufiyaa maldivien", symbol: "Rf" },
  { code: "MWK", name: "Kwacha malawien", symbol: "MK" },
  { code: "MXN", name: "Peso mexicain", symbol: "$" },
  { code: "MYR", name: "Ringgit malaisien", symbol: "RM" },
  { code: "MZN", name: "Metical mozambicain", symbol: "MT" },
  { code: "NAD", name: "Dollar namibien", symbol: "$" },
  { code: "NGN", name: "Naira nigérian", symbol: "₦" },
  { code: "NIO", name: "Córdoba nicaraguayen", symbol: "C$" },
  { code: "NOK", name: "Couronne norvégienne", symbol: "kr" },
  { code: "NPR", name: "Roupie népalaise", symbol: "₨" },
  { code: "NZD", name: "Dollar néo-zélandais", symbol: "NZ$" },
  { code: "OMR", name: "Rial omanais", symbol: "ر.ع." },
  { code: "PAB", name: "Balboa panaméen", symbol: "B/." },
  { code: "PEN", name: "Sol péruvien", symbol: "S/" },
  { code: "PGK", name: "Kina papou-néo-guinéen", symbol: "K" },
  { code: "PHP", name: "Peso philippin", symbol: "₱" },
  { code: "PKR", name: "Roupie pakistanaise", symbol: "₨" },
  { code: "PLN", name: "Zloty polonais", symbol: "zł" },
  { code: "PYG", name: "Guarani paraguayen", symbol: "₲" },
  { code: "QAR", name: "Riyal qatari", symbol: "ر.ق" },
  { code: "RON", name: "Leu roumain", symbol: "lei" },
  { code: "RSD", name: "Dinar serbe", symbol: "дин." },
  { code: "RUB", name: "Rouble russe", symbol: "₽" },
  { code: "RWF", name: "Franc rwandais", symbol: "FRw" },
  { code: "SAR", name: "Riyal saoudien", symbol: "ر.س" },
  { code: "SBD", name: "Dollar des îles Salomon", symbol: "$" },
  { code: "SCR", name: "Roupie seychelloise", symbol: "₨" },
  { code: "SDG", name: "Livre soudanaise", symbol: "ج.س." },
  { code: "SEK", name: "Couronne suédoise", symbol: "kr" },
  { code: "SGD", name: "Dollar de Singapour", symbol: "S$" },
  { code: "SLL", name: "Leone sierra-léonais", symbol: "Le" },
  { code: "SOS", name: "Shilling somalien", symbol: "Sh" },
  { code: "SRD", name: "Dollar surinamais", symbol: "$" },
  { code: "SSP", name: "Livre sud-soudanaise", symbol: "£" },
  { code: "STN", name: "Dobra santoméen", symbol: "Db" },
  { code: "SYP", name: "Livre syrienne", symbol: "£" },
  { code: "SZL", name: "Lilangeni swazi", symbol: "L" },
  { code: "THB", name: "Baht thaïlandais", symbol: "฿" },
  { code: "TJS", name: "Somoni tadjik", symbol: "ЅМ" },
  { code: "TMT", name: "Manat turkmène", symbol: "m" },
  { code: "TND", name: "Dinar tunisien", symbol: "د.ت" },
  { code: "TOP", name: "Pa'anga tongan", symbol: "T$" },
  { code: "TRY", name: "Livre turque", symbol: "₺" },
  { code: "TTD", name: "Dollar trinidadien", symbol: "$" },
  { code: "TWD", name: "Dollar taïwanais", symbol: "NT$" },
  { code: "TZS", name: "Shilling tanzanien", symbol: "TSh" },
  { code: "UAH", name: "Hryvnia ukrainienne", symbol: "₴" },
  { code: "UGX", name: "Shilling ougandais", symbol: "USh" },
  { code: "UYU", name: "Peso uruguayen", symbol: "$" },
  { code: "UZS", name: "Sum ouzbek", symbol: "лв" },
  { code: "VES", name: "Bolívar vénézuélien", symbol: "Bs." },
  { code: "VND", name: "Dong vietnamien", symbol: "₫" },
  { code: "VUV", name: "Vatu vanuatuan", symbol: "Vt" },
  { code: "WST", name: "Tala samoan", symbol: "T" },
  { code: "XAF", name: "Franc CFA (CEMAC)", symbol: "FCFA" },
  { code: "XCD", name: "Dollar des Caraïbes orientales", symbol: "$" },
  { code: "XOF", name: "Franc CFA (UEMOA)", symbol: "CFA" },
  { code: "XPF", name: "Franc CFP", symbol: "₣" },
  { code: "YER", name: "Rial yéménite", symbol: "﷼" },
  { code: "ZAR", name: "Rand sud-africain", symbol: "R" },
  { code: "ZMW", name: "Kwacha zambien", symbol: "ZK" },
  { code: "ZWL", name: "Dollar zimbabwéen", symbol: "$" },
];

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [currencySearch, setCurrencySearch] = useState("");

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  const handleSelectCurrency = (currency: typeof CURRENCIES[0]) => {
    setSelectedCurrency(currency);
    setCurrencyDialogOpen(false);
    toast({
      title: "Devise modifiée",
      description: `La devise est maintenant ${currency.name} (${currency.code})`,
    });
  };

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const userName = profile?.full_name || "Utilisateur";
  const userPhone = profile?.phone || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const settingsSections = [
    {
      title: "Compte",
      items: [
        { icon: User, label: "Profil utilisateur", action: "profile" },
        { icon: Lock, label: "Sécurité & PIN", action: "security" },
      ],
    },
    {
      title: "Préférences",
      items: [
        { icon: Bell, label: "Notifications", action: "notifications" },
        { icon: Globe, label: "Langue", value: "Français", action: "language" },
        { icon: Coins, label: "Devise", value: `${selectedCurrency.code} (${selectedCurrency.symbol})`, action: "currency" },
        { icon: Moon, label: "Thème", value: "Clair", action: "theme" },
      ],
    },
    {
      title: "Données",
      items: [
        { icon: Download, label: "Sauvegarder mes données", action: "backup" },
        { icon: Upload, label: "Restaurer la sauvegarde", action: "restore" },
      ],
    },
    {
      title: "À propos",
      items: [
        { icon: Info, label: "Informations sur l'app", value: "v1.0.0", action: "about" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary p-6 pb-8 rounded-b-[2rem]"
      >
        <h1 className="text-white text-2xl font-bold mb-6">Paramètres</h1>

        {/* Profile Card */}
        <Card className="p-5 bg-white/95 border-0 shadow-soft">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-secondary" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{userInitials}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-bold text-lg">{userName}</h3>
                <p className="text-muted-foreground text-sm">{userPhone}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </Card>
      </motion.div>

      {/* Settings Sections */}
      <div className="px-6 py-6 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h3 className="text-foreground font-semibold text-sm mb-3 px-2">
              {section.title}
            </h3>
            <Card className="border-border shadow-soft overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <button
                  key={item.label}
                  onClick={() => item.action === "currency" && setCurrencyDialogOpen(true)}
                  className={`w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-smooth ${
                    itemIndex !== section.items.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-foreground font-medium">{item.label}</p>
                    {item.value && (
                      <p className="text-muted-foreground text-sm">{item.value}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </Card>
          </motion.div>
        ))}

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-14 rounded-2xl border-2 border-destructive text-destructive hover:bg-destructive hover:text-white font-semibold"
          >
            <LogOut className="mr-2 w-5 h-5" />
            Déconnexion
          </Button>
        </motion.div>

        {/* App Logo & Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-2 pt-4"
        >
          <img src={logo} alt="MTSANGO" className="w-12 h-12 opacity-60" />
          <p className="text-muted-foreground text-xs">MTSANGO v1.0.0</p>
          <p className="text-muted-foreground text-xs">© 2025 Tous droits réservés</p>
        </motion.div>
      </div>

      {/* Currency Dialog */}
      <Dialog open={currencyDialogOpen} onOpenChange={setCurrencyDialogOpen}>
        <DialogContent className="max-w-sm bg-background">
          <DialogHeader>
            <DialogTitle>Choisir une devise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Rechercher une devise..."
              value={currencySearch}
              onChange={(e) => setCurrencySearch(e.target.value)}
              className="h-12"
            />
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleSelectCurrency(currency)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 hover:bg-muted transition-smooth ${
                      selectedCurrency.code === currency.code ? "bg-primary/10 border border-primary" : ""
                    }`}
                  >
                    <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg">
                      {currency.symbol}
                    </span>
                    <div className="text-left flex-1">
                      <p className="font-medium text-foreground">{currency.code}</p>
                      <p className="text-sm text-muted-foreground">{currency.name}</p>
                    </div>
                    {selectedCurrency.code === currency.code && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Settings;
