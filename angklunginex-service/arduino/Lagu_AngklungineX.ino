// WIRING TERBARU: docs/wiring-angklung.md (central lock 2 pin {IN1, IN2})
// motorN[2] = {IN1, IN2}
const int motor14[2]  = {25, 23};// mi_atas  (central lock 7)
const int motor13[2]  = {29, 27};// re_atas  (central lock 6)
const int motor12[2]  = {33, 31};// do_atas  (central lock 5)
const int motor11[2]  = {37, 35};// ti       (central lock 4)
const int motor10[2]  = {41, 39};// la       (central lock 3)
const int motor9[2]   = {45, 43};// sol      (central lock 2)
const int motor8[2]   = {49, 47};// fa#      (central lock 1)
const int motor7[2]   = {24, 22};// fa       (central lock 14)
const int motor6[2]   = {28, 26};// mi       (central lock 13)
const int motor5[2]   = {32, 30};// re       (central lock 12)
const int motor4[2]   = {36, 34};// do       (central lock 11)
const int motor3[2]   = {40, 38};// si bawah (central lock 10)
const int motor2[2]   = {44, 42};// la bawah (central lock 9)
const int motor1[2]   = {48, 46};// sol bawah(central lock 8)

int durasi_ms;
int iterasi;
int waktu = 1000; // Lama getaran motor


void setup() {
  Serial.begin(9600);

  for (int i = 0; i <= 1; i++) {
    pinMode(motor1[i], OUTPUT);
    pinMode(motor2[i], OUTPUT);
    pinMode(motor3[i], OUTPUT);
    pinMode(motor4[i], OUTPUT);
    pinMode(motor5[i], OUTPUT);
    pinMode(motor6[i], OUTPUT);
    pinMode(motor7[i], OUTPUT);
    pinMode(motor8[i], OUTPUT);
    pinMode(motor9[i], OUTPUT);
    pinMode(motor10[i], OUTPUT);
    pinMode(motor11[i], OUTPUT);
    pinMode(motor12[i], OUTPUT);
    pinMode(motor13[i], OUTPUT);
   pinMode(motor14[i], OUTPUT);
  }
}

// Fungsi umum untuk memainkan satu nada (central lock: {IN1, IN2})
void mainkanNada(const int motor[2], int ketukan) {
  unsigned long startTime = millis();
  while (millis() - startTime < ketukan) { // selama ketukan (ms)
    // Gerak maju (dorong)
    digitalWrite(motor[0], HIGH);
    digitalWrite(motor[1], LOW);
    delay(50);

    // Gerak mundur (tarik balik)
    digitalWrite(motor[0], LOW);
    digitalWrite(motor[1], HIGH);
    delay(50);
  }

  // Matikan motor setelah selesai
  digitalWrite(motor[0], LOW);
  digitalWrite(motor[1], LOW);

}
// Fungsi nada-nada 
void nada_sol_bawah(int ketukan)   { mainkanNada(motor1,  ketukan); }
void nada_la_bawah(int ketukan)    { mainkanNada(motor2,  ketukan); }
void nada_si_bawah(int ketukan)    { mainkanNada(motor3,  ketukan); }
void nada_do(int ketukan)          { mainkanNada(motor4,  ketukan); }
void nada_re(int ketukan)          { mainkanNada(motor5,  ketukan); }
void nada_mi(int ketukan)          { mainkanNada(motor6,  ketukan); }
void nada_fa(int ketukan)          { mainkanNada(motor7,  ketukan); }
void nada_fa2(int ketukan)         { mainkanNada(motor8,  ketukan); }
void nada_sol(int ketukan)         { mainkanNada(motor9,  ketukan); }
void nada_la(int ketukan)          { mainkanNada(motor10, ketukan); }
void nada_si(int ketukan)          { mainkanNada(motor11, ketukan); }
void nada_do_atas(int ketukan)     { mainkanNada(motor12, ketukan); }
void nada_re_atas(int ketukan)     { mainkanNada(motor13, ketukan); }
void nada_mi_atas(int ketukan)     { mainkanNada(motor14, ketukan); }

void pembukaan(){
 nada_re_atas(400);
 delay(75);
 nada_re_atas(250);
 delay(100);
 nada_re_atas(500);
 delay(25);
 nada_do_atas(500);
 delay(25);
 nada_si(250);
 delay(25);
 nada_la(600);
 delay(25);
 nada_si(500);
 delay(25);
 nada_la(250);
 delay(25);
 nada_sol(2000);
 delay(500);
}

// Indonesia, tanah airku, Tanah tumpah darahku
// Di sanalah aku berdiri, Jadi pandu ibuku.
void baitsatu(){

  // "Indonesia tanah airku"
  nada_si_bawah(450); // In
  delay(25);
  nada_do(250); // do
  delay(25); 
  nada_re(500);  // ne
  nada_si(600); // sia
  delay(200);  
  nada_si(350);  // ta
  nada_la(400); // nah
  delay(50); 
  nada_la(350); // a
  delay(25);  
  nada_sol(600); // ir
  delay(25); 
  nada_re(1000); // ku
  delay(300);

  // "Tanah tumpah darahku"
  nada_re(400); // Ta
  delay(25);  
  nada_re(350); // nah
  nada_mi(600); // tum
  nada_re(500); // pah
  nada_do(500); // da
  nada_si_bawah(500); // rah
  delay(25);  
  nada_la_bawah(1000); // ku
  delay(600);

  // "Disanalah aku berdiri"
  nada_la_bawah(350); // di
  delay(25); 
  nada_si_bawah(350); // sa
  nada_do(600); // na
  nada_la(750); // lah
  delay(100);  
  nada_la(350); // a
  nada_sol(400); // ku
  delay(50);  
  nada_sol(350); // ber
  nada_fa2(450); // di
  nada_mi(750); // ri
  delay(300);

  // "Jadi pandu ibuku"
  nada_re(400); // Ja
  delay(25);  
  nada_re(300);  // di
  nada_fa2(500);  // pan
  nada_mi(500);  // du
  nada_re(500);  // i
  nada_do(500);  // bu
  nada_si_bawah(800); // ku  
  delay(500);
}

// Indonesia kebangsaanku, Bangsa dan tanah airku, 
// Marilah kita berseru, Indonesia bersatu. 
void baitdua(){
  // "Indonesia kebangsaanku"
  nada_si_bawah(450); // In
  delay(25);
  nada_do(250); // do
  delay(25);
  nada_re(500); // ne
  nada_si(800); // sia
  delay(150);
  nada_si(350); // ke
  nada_la(400); // bang
  delay(25);
  nada_la(400); // sa
  nada_sol(600); // an
  nada_re(800); // ku
  delay(300);

  // "Bangsa dan tanah airku"
  nada_re(350); // bang
  delay(10);  
  nada_re(250); // sa
  nada_mi(600); // dan
  delay(25);
  nada_re(500); // ta
  nada_sol(500); // nah
  nada_la(500); // a
  nada_fa2(1000); // ir
  delay(50);
  nada_mi(600); // ku
  delay(125);

  // "Marilah kita berseru"
  nada_mi(400);
  delay(25);  
  nada_mi(250);  
  nada_do_atas(500); 
  delay(25); 
  nada_do_atas(350);  
  nada_si(500);  
  nada_la(500);  
  nada_re_atas(900);
  nada_sol(500);

  // "Indonesia bersatu"
  nada_fa2(350); //fis
  nada_mi(250);  
  nada_re(450);
  delay(25);  
  nada_do_atas(700);  
  nada_si(450);  
  nada_la(450);  
  nada_sol(800);  
  delay(500);
}

// Hiduplah tanahku, Hiduplah negriku, Bangsaku, Rakyatku, semuanya,
// Bangunlah jiwanya, Bangunlah badannya, Untuk Indonesia Raya. 
void baittiga(){
  // Reff: "Hiduplah tanahku, "
  nada_re(350);
  delay(10);
  nada_re(250);
  nada_mi(650);
  nada_do_atas(350);
  delay(10);
  nada_do_atas(250);
  delay(10);
  nada_do_atas(800);
  delay(100);

//  hiduplah negriku"
  nada_do_atas(350);
  delay(10);  
  nada_do_atas(250);
  nada_si(650);
  nada_sol(350);
  delay(10);
  nada_sol(250);
  delay(10);
  nada_sol(800);
  delay(100);

  // "Bangsaku, rakyatku, semuanya"
  nada_fa2(350); // Bang
  nada_sol(350); // sa
  nada_la(600); // ku
  nada_re_atas(350); // rak
  delay(25);
  nada_re_atas(1000); // yatku
  nada_do_atas(500); // se
  delay(25);
  nada_do_atas(350); // mu
  nada_si(750); // a
  nada_sol(400); // nya
  delay(300);

  // "Bangunlah jiwanya,
  nada_re(350);
  delay(10);
  nada_re(250);
  nada_mi(650);
  nada_do_atas(350);
  delay(10);
  nada_do_atas(250);
  delay(10);
  nada_do_atas(800);
  delay(100);

//  bangunlah badannya"
  nada_do_atas(350);
  delay(25);  
  nada_do_atas(250);
  nada_si(650);
  nada_sol(350);
  delay(10);
  nada_sol(250);
  delay(10);
  nada_sol(800);
  delay(100);

  // "Untuk Indonesia Raya"
  nada_fa2(350);
  nada_sol(400);
  nada_la(600);
  nada_re_atas(600);
  delay(25);
  nada_re_atas(500);
  delay(50);
  nada_si(500);
  delay(10);
  nada_la(200);
  nada_sol(800);
  delay(1000);
}

// Indonesia Raya, Merdeka, merdeka, Tanahku, neg'riku yang kucinta! Indonesia Raya, Merdeka, merdeka, Hiduplah Indonesia Raya.
void baitempat(){
  // "Indonesia Raya, 
  nada_sol(350);
  delay(10);
  nada_sol(250);
  nada_do_atas(650);
  nada_mi_atas(350);
  delay(10);
  nada_mi_atas(250);
  delay(10);
  nada_mi_atas(800);
  delay(100);

// merdeka, merdeka"
  nada_mi_atas(350);
  delay(10);
  nada_mi_atas(250);
  nada_re_atas(650);
  nada_si(350);
  delay(10);
  nada_si(250);
  delay(10);
  nada_si(800);
  delay(100);

  // "Tanahku, negriku yang kucinta"
  nada_re_atas(350);
  delay(10);
  nada_re_atas(250);
  nada_do_atas(650);
  nada_la(350);
  delay(10);
  nada_la(250);
  delay(10);
  nada_la(650);
  nada_re_atas(350);
  nada_do_atas(250);
  nada_si(1000);
  nada_sol(500);
  delay(300);

  // "Indonesia Raya, 
  nada_sol(350);
  delay(10);
  nada_sol(250);
  nada_do_atas(650);
  nada_mi_atas(350);
  delay(10);
  nada_mi_atas(250);
  delay(10);
  nada_mi_atas(800);
  delay(100);

// merdeka, merdeka"
  nada_mi_atas(350);
  delay(10);
  nada_mi_atas(250);
  nada_re_atas(650);
  nada_si(350);
  delay(10);
  nada_si(250);
  delay(10);
  nada_si(800);
  delay(150);

  // "Hiduplah Indonesia Raya!"
  nada_re_atas(600);
 delay(75);
 nada_re_atas(400);
 delay(100);
 nada_re_atas(800);
 delay(25);
 nada_do_atas(600);
 delay(25);
 nada_si(400);
 delay(25);
 nada_la(800);
 delay(25);
 nada_si(800);
 delay(25);
 nada_la(500);
 delay(25);
 nada_sol(4000);
}
void check_sound(){
  nada_sol_bawah(600);
  nada_la_bawah(600);
  nada_si_bawah(600);
  nada_do(600);
  nada_re(600);
  nada_mi(600);
  nada_fa(600);
  nada_fa2(600);
  nada_sol(600);
  nada_la(600);
  nada_si(600);
  nada_do_atas(600);
  nada_re_atas(600);
  nada_mi_atas(600);
}

void ibu_kita_kartini(){
    nada_do(800); //i
    nada_re(600); //bu
    nada_mi(600); //ki
    nada_fa(600); //ta
    nada_sol(800);//kar
    nada_mi(600); //ti
    nada_do(600); //ni

  delay(400);

  nada_la(800); //pu
  nada_do_atas(400);  //tri
  nada_si(400); //se
  nada_la(800); //ja
  nada_sol(800);//ti

  delay(800);

  nada_fa(800); //pu
  nada_la(400); //tri
  nada_sol(600);//in
  nada_fa(600); //do
  nada_mi(1000);//ne
  nada_do(800); //sia
  nada_re(800); //ha
  nada_fa(400); //rum
  nada_mi(600); //na
  nada_re(600); //ma
  nada_do(800); //nya

  delay(800);

  nada_do(800); //i
  nada_re(600); //bu
  nada_mi(600); //ki
  nada_fa(600); //ta
  nada_sol(800);//kar
  nada_mi(600); //ti
  nada_do(600); //ni

  delay(400);

  nada_la(800); //pen
  nada_do_atas(400); //de
  nada_si(400); //kar
  nada_la(800); //bang
  nada_sol(800);//sa

  delay(800);

  nada_fa(800); //pen
  nada_la(400); //de
  nada_sol(600);//kar
  nada_fa(600); //ka
  nada_mi(1000);//um
  nada_do(800); //nya
  nada_re(800); //un
  nada_fa(400); //tuk
  nada_mi(600); //mer
  nada_re(600); //de
  nada_do(800); //ka

  delay(800);

  nada_fa(800); //wa
  nada_mi(600); //hai
  nada_fa(400); //i
  nada_la(600); //bu
  nada_sol(400);//ki
  nada_la(400); //ta
  nada_sol(600);//kar
  nada_mi(400); //ti
  nada_do(600); //ni
  nada_mi(600); //pu
  nada_re(600); //tri
  nada_mi(600); //yang
  nada_fa(600); //mu
  nada_sol(600);//li
  nada_mi(1000);//a

  delay(500);

  nada_fa(800); //sung
  nada_mi(600); //guh
  nada_fa(400); //be
  nada_la(600); //sar
  nada_sol(400);//ci
  nada_la(400); //ta
  nada_sol(600);//ci
  nada_mi(400); //ta
  nada_do(600); //nya
  nada_mi(600); //ba
  nada_re(800); //gi
  nada_fa(400); //in
  nada_si_bawah(800); //do
  nada_re(600); //ne
  nada_do(1000);//sia

}



void indonesia_pusaka(){
  nada_sol_bawah(500);//in
  nada_do(500);//do
  nada_mi(1250);//ne
  nada_do(400);//sia
  nada_sol_bawah(500);//ta 
  nada_do(500);//nah
  nada_mi(500);//A
  nada_la(500);//ir
  nada_sol(1250);//Be
  nada_mi(800);//Ta

  delay(250);

  nada_do(500);//pu
  delay(100);
  nada_do(500);//sa
  delay(100);
  nada_do(1500);//ka
  nada_si_bawah(400);//A
  nada_do(500);//ba
  nada_si_bawah(500);//di
  nada_do(500);//nan
  nada_mi(500);//ja
  nada_re(1500);//ya

  delay(1000);

  nada_sol_bawah(500);//in
  nada_do(500);//do
  nada_mi(1250);//ne
  nada_do(400);//sia
  nada_sol_bawah(400);//se
  nada_do(500);//jak
  delay(100);
  nada_do(500);//du
  nada_si_bawah(500);//lu
  nada_la_bawah(1250);//ka
  nada_fa(800);//la

  nada_re(500);//sla
  nada_si_bawah(500);//lu
  nada_do(1250);//di
  nada_sol(500);//pu
  nada_fa(500);//ja
  nada_sol(500);//pu
  nada_fa(500);//ja
  nada_si_bawah(500);//bang
  nada_do(1250);//sa

  delay(1000);

  nada_sol(500);//di
  delay(100);
  nada_sol(500);//sa
  delay(100);
  nada_sol(1500);//na
  nada_la(500);//tem
  nada_sol(500);//pat
  nada_fa(500);//la
  nada_re(500);//hir
  nada_si_bawah(500);//be
  nada_sol_bawah(1500);//ta

  delay(500);

  nada_mi(500);//di
  delay(100);
  nada_mi(800);//bu
  delay(100);
  nada_mi(1000);//ai
  nada_fa(500);//di
  nada_mi(500);//be
  nada_re(500);//sar
  nada_do(800);//kan
  nada_si_bawah(500);//bun
  nada_la_bawah(1500);//da

  delay(500);

  nada_la_bawah(500);//tem
  nada_si_bawah(500);//pat
  nada_do(1000);//ber
  nada_si_bawah(500);//lin
  nada_do(800);//dung
  nada_re(400);//di
  nada_mi(500);//ha
  nada_fa(500);//ri
  nada_la(1500);//tu
  nada_sol(800);//a
  nada_sol_bawah(500);//sam
  nada_do(500);//pai
  nada_mi(1000);//a
  nada_sol(600);//khir
  nada_fa(600);//me
  nada_sol(500);//nu
  nada_fa(500);//tup
  nada_si_bawah(500);//ma
  nada_do(2000);//ta~

  delay(1000);
}

void halo_halo_bandung(){
  nada_sol_bawah(600);//ha
  nada_mi(1200);  //lo
  nada_re(500);   //ha
  nada_si_bawah(500);//lo
  nada_re(700);   //ban
  nada_do(1000);   //dung

  nada_sol_bawah(300);//i
  nada_la_bawah(300); //bu
  nada_si_bawah(300); //ko
  nada_do(700);   //ta
  nada_si_bawah(500); //pe
  nada_la_bawah(500); //ri
  nada_sol_bawah(700);//a
  nada_si_bawah(1000); //ngan

  delay(600);

  nada_sol_bawah(600);  //ha
  nada_fa(1200);  //lo
  nada_mi(500);   //ha
  nada_re(400);   //lo
  nada_mi(700);   //ban
  nada_re(1000);  //dung

  delay(200);

  nada_re(300);   //ko
  nada_do(300);   //ta
  nada_si_bawah(700); //ke
  nada_re(500);   //nang
  nada_sol(500);  //ke
  nada_la(700);   //nang
  nada_mi(1000);  //ngan

  delay(600);
  
  nada_sol_bawah(600);  //su
  nada_mi(1200);  //dah
  nada_re(500);  //la
  nada_si_bawah(500);  //ma
  nada_re(700);  //be
  nada_do(1000);  //ta

  delay(100);

  nada_sol_bawah(300); //ti
  nada_la_bawah(300);  //dak
  nada_si_bawah(300);  //ber
  nada_do(700);  //jum
  nada_mi(500);  //pa
  nada_fa(700);  //de
  nada_mi(700);  //ngan
  nada_la_bawah(1000);  //kau

  delay(600);

  nada_la_bawah(500);  //se
  nada_si_bawah(400);  //ka
  nada_do(800);  //rang
  nada_si_bawah(300); //te
  nada_re(300);  //lah
  nada_do(300);  //men
  nada_si_bawah(300);  //ja
  nada_la_bawah(300);  //di
  nada_sol_bawah(300); //la
  nada_la_bawah(300);  //u
  nada_sol_bawah(300); //tan
  nada_do(300);  //a
  nada_mi(300);  //pi

  delay(100);
  
  nada_mi(300);  //ma
  nada_fa(300);  //ri
  nada_mi(400);  //bung
  nada_re(300);  //re
  nada_re(300);  //but
  nada_la_bawah(500);  //kem
  nada_si_bawah(500);  //ba
  nada_do(1000);  //li
}


void padamu_negeri(){
  nada_do(800); //pa
  nada_fa(800); //da
  nada_re(600); //mu
  nada_do(900); //ne
  nada_la_bawah(1000);//gri
  delay(300); 
  nada_do(1000); //ka
  delay(150);
  nada_do(600); //mi
  nada_fa(1000); //ber
  nada_sol(600);  //jan
  nada_la(1200); //ji

  delay(500);

  nada_si(800); //pa
  nada_do_atas(800);  //da
  delay(150); 
  nada_do_atas(600);  //mu
  nada_la(900); //ne
  nada_fa(1000); //gri
  delay(300);
  nada_mi(800); //ka
  nada_fa(600); //mi
  nada_sol(1000);  //ber
  nada_la(600); //bak
  nada_sol(1200);  //ti

  delay(500);

  nada_do(800); //pa
  nada_fa(800); //da
  nada_re(600); //mu
  nada_do(900); //ne
  nada_la_bawah(1000);//gri
  delay(300); 
  nada_do(1300); //ka
  delay(150);
  nada_do(600); //mi
  nada_fa(1000); //me
  nada_sol(600);  //ngab
  nada_la(1200); //di

  delay(500);
  
  nada_si(800); //ba
  nada_do_atas(800);  //gi
  delay(150); 
  nada_do_atas(600);  //mu
  nada_la(900); //ne
  nada_fa(1000); //gri
  delay(300);

  nada_sol(900);  //ji
  nada_la(900);   //wa
  nada_si(900);   //ra
  nada_la(1500);  //ga
  nada_sol(1500); //ka
  nada_fa(1500);  //mi

  delay(1000);
}

void apuse(){
  nada_sol_bawah(500); //a
  nada_do(500); //pu
  nada_mi(1000); //se
  nada_re(500);  //ko
  nada_mi(500);  //kon
  nada_re(400); //da
  nada_do(1000);  //o
  delay(300);
  nada_sol_bawah(500);  //ya
  nada_do(500); //ra
  nada_mi(1000); //be
  delay(100);
  nada_mi(300); //so
  nada_re(300); //ren
  nada_mi(300); //do
  nada_fa(300); //re
  nada_re(1000);  //ri

  delay(500);

  nada_sol_bawah(500);  //wuf
  nada_do(500); //le
  nada_re(1000);  //so
  nada_fa(500); //ba
  nada_sol(500);  //ni
  nada_fa(500); //ne
  nada_mi(1000); //ma
  nada_re(500); //ba
  nada_mi(500); //ki
  nada_re(400); //pa
  nada_do(1000);  //se

  delay(500);

  nada_sol_bawah(500); //a
  nada_do(500); //pu
  nada_mi(1000); //se
  nada_re(500);  //ko
  nada_mi(500);  //kon
  nada_re(400); //da
  nada_do(1000);  //o
  delay(300);
  nada_sol_bawah(500);  //ya
  nada_do(500); //ra
  nada_mi(1000); //be
  delay(100);
  nada_mi(300); //so
  nada_re(300); //ren
  nada_mi(300); //do
  nada_fa(300); //re
  nada_re(1000);  //ri

  delay(500);

  nada_sol_bawah(500);  //wuf
  nada_do(500); //len
  nada_re(1000);  //so
  nada_fa(500); //ba
  nada_sol(500);  //ni
  nada_fa(500); //ne
  nada_mi(1000); //ma
  nada_re(500); //ba
  nada_mi(500); //ki
  nada_re(400); //pa
  nada_do(1000);  //se

  delay(500);

  nada_sol_bawah(500);  //a
  nada_do(500);  //ra
  nada_fa(500);  //fa
  nada_mi(1500);  //be
  delay(500);
  nada_sol_bawah(500);//as
  nada_si_bawah(500);  //wa
  nada_re(500);  //rak
  nada_do(1500);  //wa

  delay(500);

  nada_sol_bawah(500);  //a
  nada_do(500);  //ra
  nada_fa(500);  //fa
  nada_mi(1500);  //be
  delay(500);
  nada_sol_bawah(500);//as
  nada_si_bawah(500);  //wa
  nada_re(500);  //rak
  nada_do(1500);  //wa

  delay(1000);
}

void manuk_dadali(){
  
  nada_sol(300);//me
  nada_mi(300);//sat
  nada_fa(400);//nga
  nada_sol(300);//pung
  nada_si(300);//lu
  nada_do_atas(300);//hur
  delay(300);
  nada_si(300);//ja
  nada_do_atas(300);//uh
  nada_mi(300);//di
  nada_fa(300);//a
  nada_sol(300);//wang
  delay(100);
  nada_sol(500);//a
  delay(100);
  nada_sol(500);//wang

  delay(500);

  nada_sol(300);//me
  nada_mi(300);//ber
  nada_fa(400);//keun
  nada_sol(400);//jan
  nada_si(400);//jang
  nada_do_atas(300);//na
  delay(300);
  nada_si(300);//bang
  nada_do_atas(300);//un
  nada_mi(300);//ta
  nada_fa(300);//ya
  nada_sol(300);//ka
  nada_fa(500);//ring
  delay(100);
  nada_fa(500);//rang

  delay(500);

  nada_sol(400);//su
  nada_fa(400);//ku
  nada_mi(400);//na
  nada_do(500);//rang
  nada_si_bawah(400);//ga
  nada_do(400);//os
  nada_mi(500);//reu
  nada_fa(500);//jeung
  nada_sol(400);//pa
  nada_do(400);//ma
  nada_mi(400);//tuk
  nada_fa(400);//na
  delay(100);
  nada_fa(400);//nge
  delay(100);
  nada_fa(400);//luk

  delay(500);

  nada_sol(300);//nga
  nada_fa(400);//pak
  nada_mi(300);//me
  nada_do(400);//ga
  nada_si_bawah(400);//ba
  nada_do(400);//ri
  nada_mi(400);//hi
  nada_fa(400);//ber
  nada_sol(400);//na
  nada_do(400);//ta
  nada_mi(400);//rik
  nada_do(500);//nyu
  delay(100);
  nada_do(500);//ru
  delay(100);
  nada_do(500);//wuk

  delay(800);

  nada_sol(300);//sa
  nada_mi(300);//ha
  nada_fa(400);//a
  nada_sol(300);//nu
  nada_si(300);//bi
  nada_do_atas(300);//sa
  delay(300);
  nada_si(300);//nyu
  nada_do_atas(300);//sul
  nada_mi(300);//ka
  nada_fa(300);//na
  nada_sol(300);//tan
  delay(100);
  nada_sol(300);//dang
  delay(100);
  nada_sol(500);//na

  delay(300);

  nada_sol(300);//tan
  nada_mi(300);//dang
  nada_fa(400);//jeung
  nada_sol(400);//per
  nada_si(400);//ten
  nada_do_atas(300);//tang
  delay(300);
  nada_si(300);//ta
  nada_do_atas(300);//ya
  nada_mi(300);//ban
  nada_fa(300);//ding
  nada_sol(300);//an
  nada_fa(500);//na
  delay(100);
  nada_fa(500);//na

  delay(500);

  nada_sol(300);//di
  nada_fa(300);//pi
  nada_mi(300);//ka
  nada_do(500);//gim
  nada_si_bawah(400);//bir
  nada_do(300);//di
  nada_mi(400);//pi
  nada_fa(400);//ka
  nada_sol(300);//se
  nada_do(400);//rab
  nada_mi(400);//ku
  nada_fa(300);//ta
  delay(100);
  nada_fa(300);//tang
  delay(100);
  nada_fa(300);//ga

  delay(500);

  nada_sol(400);//ta
  nada_fa(400);//ya
  nada_mi(400);//ka
  nada_do(400);//rem
  nada_si_bawah(400);//pan
  nada_do(400);//ka
  nada_mi(400);//si
  nada_fa(400);//eun
  nada_sol(400);//le
  nada_do(400);//ber
  nada_mi(400);//wa
  nada_do(400);//wa
  delay(100);
  nada_do(400);//nen
  delay(100);
  nada_do(400);//na

  delay(500);

  nada_do(500);//ma
  nada_fa(500);//nuk
  nada_sol(500);//da
  nada_la(500);//da
  nada_fa(500);//li
  nada_la(800);//i

  delay(300);

  nada_la(500);//ma
  nada_fa(500);//nuk
  nada_sol(500);//pang
  nada_la(500);//ga
  delay(100);
  nada_la(500);//gah
  delay(100);
  nada_la(500);//na

  delay(500);

  nada_do_atas(500);//per
  nada_si(500);//lem
  nada_la(500);//bang
  nada_sol(500);//sak
  nada_mi(500);//ti
  nada_sol(800);//i

  delay(300);

  nada_la(500);//in
  nada_mi(500);//do
  nada_la(500);//ne
  nada_sol(500);//sia
  delay(100);
  nada_sol(500);//ja
  delay(100);
  nada_sol(500);//ya

  delay(500);

  nada_do(500);//ma
  nada_fa(500);//nuk
  nada_sol(500);//da
  nada_la(500);//da
  nada_fa(500);//li
  nada_la(800);//i

  delay(300);

  nada_la(500);//pang
  nada_fa(500);;//ka
  nada_sol(500);//kon
  nada_la(500);//ca
  delay(100);
  nada_la(500);//ra
  delay(100);
  nada_la(500);//na
  
  delay(300);

  nada_la(500);//re
  nada_si(500);//sep
  nada_do_atas(500);//nga
  nada_re(500);//hi
  nada_si(500);//ji
  nada_sol(800);//i

  delay(500);

  nada_la(500);//ru
  nada_si(500);//kun
  nada_re(500);//sa
  nada_do_atas(500);//ka
  delay(100);
  nada_do_atas(500);//beh
  delay(100);
  nada_do_atas(500);//na
  
  delay(500);

  nada_sol(300);//hi
  nada_mi(400);//rup
  nada_fa(300);//sa
  nada_sol(300);//u
  nada_si(300);//yun
  nada_do_atas(300);//nan
  delay(300);
  nada_si(400);//ta
  nada_do_atas(400);//ra
  nada_mi(400);//pa
  nada_fa(400);//hi
  nada_sol(400);//ri
  delay(100);
  nada_sol(500);//hi
  delay(100);
  nada_sol(500);//ri

  delay(500);

  nada_sol(300);//si
  nada_mi(400);//lih
  nada_fa(300);//pi
  nada_sol(400);//ka
  nada_si(400);//nya
  nada_do_atas(300);//ah
  nada_si(500);//teu
  nada_do_atas(400);//ing
  nada_mi(400);//gis
  nada_fa(400);//be
  nada_sol(400);//la
  nada_fa(400);//pa
  delay(100);
  nada_fa(500);//ti

  delay(500);

  nada_sol(400);//ma
  nada_fa(400);//nuk
  nada_mi(400);//da
  nada_do(500);//da
  nada_si_bawah(500);//li
  nada_do(400);//ngan
  nada_mi(400);//dung
  nada_fa(400);//si
  nada_sol(300);//lo
  nada_do(300);//ka
  nada_mi(300);//si
  nada_fa(300);//na
  delay(100);
  nada_fa(300);//tri
  delay(100);
  nada_fa(500);//a

  delay(500);

  nada_sol(400);//keur
  nada_fa(400);//sa
  nada_mi(400);//kum
  nada_si_bawah(400);//na
  nada_do(400);//bang
  nada_mi(400);//sa
  nada_fa(400);//di
  nada_sol(400);//na
  nada_do(400);//ga
  nada_mi(400);//ra
  nada_do(400);//in
  delay(100);
  nada_do(400);//ne
  delay(100);
  nada_do(1000);//sia
}

void loop() {
  // pembukaan();
  // baitsatu();
  // baitdua();
  // baittiga();
  // baitempat();
  // // delay(5000);
  // ibu_kita_kartini();
  // indonesia_pusaka();
  // halo_halo_bandung();
  // padamu_negeri();
  // apuse();
  // manuk_dadali();
  check_sound();
}