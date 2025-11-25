import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserPlus, Lock, Activity, History, Search, Eye, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Role, User } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

export default function SettingsPage() {
  const { state } = useApp();
  const { users, sales, products } = state;
  const [activeTab, setActiveTab] = useState("users");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState('');

  // Mock Permissions Data (In a real app, this would be in global state)
  const [permissions, setPermissions] = useState({
    admin: { canEditProducts: true, canViewReports: true, canManageUsers: true, canSell: true, canDiscount: true },
    manager: { canEditProducts: true, canViewReports: true, canManageUsers: false, canSell: true, canDiscount: true },
    seller: { canEditProducts: false, canViewReports: false, canManageUsers: false, canSell: true, canDiscount: false },
  });

  const handlePermissionChange = (role: Role, key: string, value: boolean) => {
    setPermissions({
      ...permissions,
      [role]: { ...permissions[role as keyof typeof permissions], [key]: value }
    });
  };

  // Filtered Sales History for Audit Trail
  const filteredHistory = sales.filter(s => 
    s.id.toLowerCase().includes(searchHistory.toLowerCase()) || 
    s.userId.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Administração</h1>
          <p className="text-muted-foreground">Gerenciamento de usuários, permissões e auditoria.</p>
        </div>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2"><UserPlus className="h-4 w-4" /> Usuários</TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2"><Shield className="h-4 w-4" /> Permissões</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2"><History className="h-4 w-4" /> Rastreio & Auditoria</TabsTrigger>
        </TabsList>

        {/* USERS MANAGEMENT */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end">
             <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/20">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Usuário</DialogTitle>
                  <DialogDescription>Crie um novo perfil de acesso ao sistema.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nome Completo</Label>
                    <Input placeholder="Ex: João Silva" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Função (Grupo)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gestor</SelectItem>
                        <SelectItem value="seller">Vendedor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsAddUserOpen(false)}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usuários do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                          <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                        </div>
                        {user.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role === 'manager' ? 'Gestor' : user.role === 'seller' ? 'Vendedor' : 'Admin'}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="bg-green-100 text-green-800">Ativo</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm"><Lock className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PERMISSIONS MANAGEMENT */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Acesso por Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permissão</TableHead>
                    <TableHead className="text-center">Administrador</TableHead>
                    <TableHead className="text-center">Gestor</TableHead>
                    <TableHead className="text-center">Vendedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Editar Produtos</TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.admin.canEditProducts} onCheckedChange={(c) => handlePermissionChange('admin', 'canEditProducts', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.manager.canEditProducts} onCheckedChange={(c) => handlePermissionChange('manager', 'canEditProducts', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.seller.canEditProducts} onCheckedChange={(c) => handlePermissionChange('seller', 'canEditProducts', !!c)} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ver Relatórios Financeiros</TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.admin.canViewReports} onCheckedChange={(c) => handlePermissionChange('admin', 'canViewReports', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.manager.canViewReports} onCheckedChange={(c) => handlePermissionChange('manager', 'canViewReports', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.seller.canViewReports} onCheckedChange={(c) => handlePermissionChange('seller', 'canViewReports', !!c)} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Gerenciar Usuários</TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.admin.canManageUsers} onCheckedChange={(c) => handlePermissionChange('admin', 'canManageUsers', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.manager.canManageUsers} onCheckedChange={(c) => handlePermissionChange('manager', 'canManageUsers', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.seller.canManageUsers} onCheckedChange={(c) => handlePermissionChange('seller', 'canManageUsers', !!c)} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Aplicar Descontos no PDV</TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.admin.canDiscount} onCheckedChange={(c) => handlePermissionChange('admin', 'canDiscount', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.manager.canDiscount} onCheckedChange={(c) => handlePermissionChange('manager', 'canDiscount', !!c)} /></TableCell>
                    <TableCell className="text-center"><Checkbox checked={permissions.seller.canDiscount} onCheckedChange={(c) => handlePermissionChange('seller', 'canDiscount', !!c)} /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT TRAIL */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar transação, usuário ou produto..." 
                className="pl-9" 
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rastreio Completo de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Detalhes (Rastreio Dinâmico)</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((sale) => {
                    const user = users.find(u => u.id === sale.userId);
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(sale.timestamp), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium">{user?.name || 'Desconhecido'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Venda Realizada</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            {sale.items.map((item, idx) => {
                              const product = products.find(p => p.id === item.productId);
                              return (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="font-mono bg-muted px-1 rounded">
                                    {product?.sku}
                                  </span>
                                  <span>{product?.name}</span>
                                  <span className="text-muted-foreground">
                                    ({item.quantity}{product?.unit} saindo)
                                  </span>
                                </div>
                              );
                            })}
                            <div className="text-muted-foreground pt-1 border-t border-border mt-1">
                              Pagamento via <span className="uppercase font-bold">{sale.paymentMethod}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(sale.total)}
                        </TableCell>
                        <TableCell className="text-right">
                           <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalhes da Transação #{sale.id}</DialogTitle>
                                <DialogDescription>Rastreio completo do movimento de estoque</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                  <h4 className="font-bold mb-2 text-sm">Movimentação de Estoque</h4>
                                  <div className="space-y-2">
                                    {sale.items.map((item, idx) => {
                                      const product = products.find(p => p.id === item.productId);
                                      // Simulation of "stock before" just for UI (in real app we'd need historical snapshots)
                                      const stockNow = product?.stock || 0;
                                      const stockBefore = stockNow + item.quantity; 
                                      
                                      return (
                                        <div key={idx} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                                          <div>
                                            <p className="font-medium">{product?.name}</p>
                                            <p className="text-xs text-muted-foreground">SKU: {product?.sku}</p>
                                          </div>
                                          <div className="text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                              <span className="text-muted-foreground">{stockBefore}{product?.unit}</span>
                                              <span className="text-destructive font-bold">-{item.quantity}{product?.unit}</span>
                                              <span className="font-bold text-primary">→ {stockNow}{product?.unit}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                              Valor unitário na venda: {formatCurrency(item.priceAtSale)}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                    <p className="text-xs text-blue-600 uppercase font-bold">Método Pagamento</p>
                                    <p className="text-lg font-bold text-blue-900 capitalize">{sale.paymentMethod}</p>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded border border-green-100">
                                    <p className="text-xs text-green-600 uppercase font-bold">Total Recebido</p>
                                    <p className="text-lg font-bold text-green-900">{formatCurrency(sale.total)}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { Badge } from '@/components/ui/badge';
