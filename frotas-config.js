const FROTAS_DISPONIVEIS = {
  'tabela-cam-proprio': ['311015','311025','311115','311125','31115','311215','31125','311325','311425','311525','311625','311725','311825','311925','312025','31215','31225','31315','31316','31325','31415','31425','31515','31525','31615','31625','31725','31825','31925','31815','311225'],
  'tabela-cam-terceiro': ['91015','91065','91203','91207','91209','91210','91277','91280','91282','91284','91286','91291','91301','91374','91375','91376','91378','91379','91380','91383','91393','91394','91396','91397','91398','91399','91400','91410','91411','91412','91413'],
  'tabela-cam-borracharia': ['311015','311025','311115','311125','31115','311215','31125','311325','311425','311525','311625','311725','311825','311925','312025','31215','31225','31315','31316','31325','31415','31425','31515','31525','31615','31625','31725','31825','31925','31815','311225','91015','91065','91203','91207','91209','91210','91277','91280','91282','91284','91286','91291','91301','91374','91375','91376','91378','91379','91380','91383','91393','91394','91396','91397','91398','91399','91400','91410','91411','91412','91413'],
  'tabela-col-proprio': ['80118','80120','80122','80124','80217','80222','80224','80322','80519','80619','80316','80317','80319','80320','80420','80422','80119','80219','80719','80419'],
  'tabela-col-terceiro': ['93034','93044','93058','93059','93080','93081','93078','93079','93069','93070','93071','93066'],
  'tabela-transbordo': ['92060','92079','92194','92201','92252','92264','92266','92269','92465','92466','92498','92499','92501','92504','92505','92506','92508','92509','92606','92607','92630','92631','92632','92657','92658','92659','92660','92661','92662','92663','92664','92665','92666','92667','92668','92669','92670','92671','92672','92673','92674','92677','92678','92682','92686','92687','92688','92690','92691','92692','92693','92694','92695','92696','92697','92698','92701','92703','92704','92706','92707']
};
const PREFIXOS_VALIDOS = {
  'tabela-cam-proprio': ['31'], 'tabela-cam-terceiro': ['91'],
  'tabela-cam-borracharia': ['31','91'], 'tabela-col-proprio': ['80'],
  'tabela-col-terceiro': ['93'], 'tabela-transbordo': ['92']
};
const TABELAS = ['tabela-cam-proprio','tabela-cam-terceiro','tabela-cam-borracharia','tabela-col-proprio','tabela-col-terceiro','tabela-transbordo'];
const CONTADORES = {
  'tabela-cam-proprio':'contador-cam-proprio','tabela-cam-terceiro':'contador-cam-terceiro',
  'tabela-cam-borracharia':'contador-cam-borracharia','tabela-col-proprio':'contador-col-proprio',
  'tabela-col-terceiro':'contador-col-terceiro','tabela-transbordo':'contador-transbordo'
};
const GCS = {
  'tabela-cam-proprio':'gc-cam-proprio','tabela-cam-terceiro':'gc-cam-terceiro',
  'tabela-cam-borracharia':'gc-cam-borracharia','tabela-col-proprio':'gc-col-proprio',
  'tabela-col-terceiro':'gc-col-terceiro','tabela-transbordo':'gc-transbordo'
};
const PILLS = {
  'tabela-cam-proprio':'pill-caminhao','tabela-cam-terceiro':'pill-caminhao',
  'tabela-cam-borracharia':'pill-caminhao','tabela-col-proprio':'pill-colhedora',
  'tabela-col-terceiro':'pill-colhedora','tabela-transbordo':'pill-transbordo'
};